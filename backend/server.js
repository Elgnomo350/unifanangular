const express = require('express');
const cors = require('cors');
const z = require('zod')
const app = express();
const admin = require('firebase-admin');
const serviceAccount = require('./clave.json');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const crypto = require("node:crypto");
require('dotenv').config();
const {configBBDD} = require("./db.config")
const initModels = require("./models/init-models");
const pkg = require('pg');
const { Pool } = pkg;
const path = require("path");
const fs = require("fs");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const dbr = configBBDD()
const models = initModels(dbr)

const dbcon = new Pool({
  connectionString: process.env.DATABASE_URI,
  ssl: {
    rejectUnauthorized: false
  }
});

app.listen(23000, () => console.log(`listening on http://localhost:${23000}`));

const usuarioSchema = z.object({
  nom: z.string().refine(campo => campo.trim().length > 0, {
  error: "El nombre no puede estar vacío"
  }),

  cognom: z.string().refine(campo => campo.trim().length > 0, {
  error: "El apellido no puede estar vacío"
  }),

  correu: z.email({error: "Email con formato incorrecto, sigue el formato text@text.text"}),

  passwd: z.string()
    .refine(campo => campo.trim().length > 0, {
    error: "La contraseña no puede estar vacía"
    })
    .regex(/[A-Z]/, {error: "Debe tener una mayúscula"})
    .regex(/[0-9]/, {error: "Debe tener un número"}),

  direccio: z.string().refine((campo) => campo.trim().length > 0, {
  error: "La dirección no puede estar vacía"
  }),

  telefon: z.string()
  .regex(/^[0-9]{9}$/, {
    error: "Teléfono con formato incorrecto, pon 9 dígitos juntos"
  })
  .refine((campo) => campo.trim().length > 0, {
    error: "El numero de telefono no puede estar vacío"
  }),

  cesta: z.array(
    z.object({
      foto: z.string(),
      nom: z.string(),
      quantitatcomprada: z.number(),
      preutotal: z.number(),
      preuperunitat: z.number()
    })
  )

});


  const usuarioIniciarSesion = z.object({
  correu: z.email({error: "Email con formato incorrecto, sigue el formato text@text.text"}),
  passwd: z.string({error: "Has puesto algo invalido como contraseña."})
});

const SECRET_KEY = process.env.SECRET_KEY; 

async function sendMail(to, subject, html) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      sender: {
        email: process.env.BREVO_SENDER,
        name: "Unifan"
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html
    })
  });
}

async function comprovacio(request){
  try {
  const token = request.cookies.token || null;
  if (!token) return {
    message: "El servidor no ha recibido un token valido",
    code: 401
  }

  const dades = jwt.verify(token, SECRET_KEY); 

  const user = db.collection('unifan').doc(dades.correu);
  const userSnap = await user.get();

  if (!userSnap.exists) return {
    message: "Usuario no encontrado",
    code: 401
  }

  const activeSessions = userSnap.data().activeSessions || [];

  if (!activeSessions.includes(dades.sessionID)) {
      return { 
        message: "SessionID inválida",
        code: 401
      }
  } 

  return {code: 200, token: token, dades: dades, activeSessions: activeSessions, user: user}
  } catch (error) {
    return {
      message: "Ha ocurrido un error " + error,
      code: 500
    }
  }
}

async function limpiarSessionID(docId) {
  try {
    const db = admin.firestore();
    const docRef = db.collection("usuaris").doc(docId);

    await docRef.update({
      sessionID: []
    });

  } catch (error) {
    console.error("Error limpiando sessionID:", error);
  }
}

//Aqui se ve el 4.2 de la investigación, verificar correo
app.post("/registrar", async (req, res) => {
  try {

    const result = usuarioSchema.safeParse(req.body);

     if (!result.success) {
      const errorTree = z.treeifyError(result.error);
      const error = Object.keys(errorTree.properties)[0]

      res.status(400).json({message: "Error: " + errorTree.properties[error].errors[0]});
      return;
    }


    const user = db.collection('unifan').doc(result.data.correu);

    if((await user.get()).exists){
      res.status(409).json({ message: "El usuario " + result.data.correu + " ya está registrado, use otro correo." });
      return;
    }

    const sessionID = crypto.randomBytes(4).readUInt32BE(0).toString()
  
    const token = jwt.sign({data: result.data, sessionID: sessionID}, SECRET_KEY, {expiresIn: "30m"})
    const confirmarLink = `http://localhost:4200/confirmarusuari?token=${token}`
    await db.collection("unifan").doc("registresessions").set({
        sessions: admin.firestore.FieldValue.arrayUnion(token),
    }, {merge: true})

    await sendMail(
      req.body.correu,
      "Confirmar email",
      `
      <h2>Confirmar registro</h2>
      <p>Haz clic en el siguiente enlace para confirmar tu registro:</p>
      <a href="${confirmarLink}">${confirmarLink}</a>
      <p>Este enlace expirará en 30 minutos.</p>
      <p>No compartas esto a nadie.</p>
      `
    );

    res.status(201).json({ mensaje: "Un enlace de verificacion ha sido mandado a su correo" });
    return;
  } catch (error) {
    const err = error.message
    res.status(500).json({ message: "Hi ha hagut un error: " + err });
    return;
  }

})

app.post("/ferregistre", async (req, res) => {
  
  try {

  const info = jwt.verify(req.body.token, SECRET_KEY)
  const tempTokens = db.collection("unifan").doc("registresessions")
  const activeSessions = (await tempTokens.get()).data().sessions

  if(!req.body.token || !activeSessions.includes(req.body.token)){
    return res.status(403).send({message: "Token invalido o no existente"})
  }

  const { nom, cognom, correu, passwd, direccio, telefon, cesta } = info.data;
  const user = db.collection("unifan").doc(correu)

  await db.collection("unifan").doc("registresessions").update({
      sessions: admin.firestore.FieldValue.arrayRemove(req.body.token)
  });

  await user.set({
      nom: nom,
      cognom: cognom,
      correu: correu,
      passwd: passwd,
      direccio: direccio,
      telefon: telefon,
      cesta: cesta,
      role: "usuario"
  });

  res.status(201).json({ mensaje: "Usuario " + correu + " registrado" });
  } catch (error) {
    const err = error.message
    res.status(500).json({ message: "Hi ha hagut un error: " + err });
    return;
  }
})

app.post("/iniciarsessio", async (req, res) => {
    const result = usuarioIniciarSesion.safeParse(req.body);

    if (!result.success) {
      const errorTree = z.treeifyError(result.error);
      const error = Object.keys(errorTree.properties)[0]

      res.status(400).json({message: "Error: " + errorTree.properties[error].errors[0]});
      return;
    }

    const { correu, passwd } = result.data;
  
    const user = db.collection('unifan').doc(correu);
    const userSnap = await user.get();

    try {
     if(!userSnap.exists){
      res.status(404).json({ message: "El usuario " + correu + " no existe." });
      return;
    } 

    const userData = userSnap.data();

    if(passwd === userData.passwd){    

    const { nom, cognom, correu, passwd, direccio, telefon, cesta, role } = userData;
    
    
    const sessionID = crypto.randomBytes(4).readUInt32BE(0).toString()

    user.set({
      activeSessions: admin.firestore.FieldValue.arrayUnion(sessionID),
    }, {merge: true})

    const payload = {
      nom: nom,
      cognom: cognom,
      correu: correu,
      direccio: direccio,
      telefon: telefon,
      sessionID: sessionID,
      cesta: cesta,
      role: role
    }
    
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "7d" });

    res.cookie('token', token, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 1000 * 60 * 60 * 24 * 7
    })

    res.status(200).json({
      token: token,
      mensaje: "Inicio de sesion exitoso"
    })
      
    return;
    }
    else{
    res.status(401).json({
      message: "Has puesto el correo o contraseña mal"
    })
    return;
    }

    } catch (error) {
    const err = error.message
    res.status(500).json({ message: "Ha habido un error: " + err });
    return;
    }

})

app.get('/loggedin', async (req, res) => {  
  
  try {
    const comprovar = await comprovacio(req)

    if(comprovar.code !== 200){
      return res.status(comprovar.code).json({message: comprovar.message})
    }
    

    res.cookie('token', comprovar.token, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 1000 * 60 * 60 * 24 * 7
    })

    res.status(200).json({ token: comprovar.token });
    return 

  } catch (error) {
    const err = error.message
    res.status(500).json({ message: "Ha habido un error: " + err });
    return;
  } 
});


app.post("/cerrarsesion", async (req, res) => {
    
  try {

  const cestaSchema = z.array(
    z.object({
    foto: z.string(),
    nom: z.string(),
    quantitatcomprada: z.number(),
    preutotal: z.number(),
    preuperunitat: z.number()
    })
  )
  
  const resultado = cestaSchema.safeParse(req.body.cesta);

  if (!resultado.success) {
      res.status(400).json({
        message: resultado.error.issues[0].message
      })
      return;
  }

  const comprovar = await comprovacio(req)

    if(comprovar.code !== 200){
      return res.status(comprovar.code).json({message: comprovar.message})
    }
    
    const { code, token, dades, activeSessions, user } = comprovar

    const updatedSessions = activeSessions.filter(s => s !== dades.sessionID);
    await user.update({ activeSessions: updatedSessions, cesta: req.body.cesta});

    res.cookie('token', token, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 0
    })

    res.status(200).json({mensaje: "Cierre de sesión exitoso"})
    return
    } catch (error) {
    const err = error.message
    res.status(500).json({ message: "Ha habido un error: " + err });
    return;
    }
})

app.delete("/borrarmicuenta", async (req, res) => {
  try {
    
    const comprovar = await comprovacio(req)

    if(comprovar.code !== 200){
      return res.status(comprovar.code).json({message: comprovar.message})
    }

    db.collection("unifan").doc(comprovar.dades.correu).delete().then(() => {
    return res.status(200).json({mensaje: "Cuenta " + comprovar.dades.correu + " eliminada correctamente"})
  })

  } catch (error) {
    const err = error.message
    res.status(500).json({ message: "Ha habido un error: " + err });
    return;
  }
})

app.patch("/modificarcampo", async (req, res) => {

  try {
    const comprovar = await comprovacio(req)

  if(comprovar.code !== 200){
      return res.status(comprovar.code).json({message: comprovar.message})
    }

  const { code, token, dades, activeSessions, user } = comprovar

  if(!(req.body.campo in dades)) return res.status(400).send({message: "Campo no encontrado"})
  
  if(req.body.campo === "passwd") return res.status(400).send({message: "No puedes modificar la contraseña desde aqui"})
  if(req.body.campo === "correu") return res.status(400).send({message: "No puedes modificar el correo desde aqui"})

  await user.update({[req.body.campo]: req.body.contenido})

  const novesdades = (await user.get()).data()

  const { nom, cognom, correu, passwd, direccio, telefon, cesta, role } = novesdades;

  const payload = {
    nom: nom,
    cognom: cognom,
    correu: correu,
    direccio: direccio,
    telefon: telefon,
    sessionID: dades.sessionID,
    cesta: cesta,
    role: role
  }

  const newtoken = jwt.sign(payload, SECRET_KEY);

    res.cookie('token', newtoken, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 1000 * 60 * 60 * 24 * 7
    })

  res.status(200).send({
    mensaje: "El campo " + req.body.campo + " ha sido actualizado",
    token: newtoken
  })
 
  } catch (error) {
    const err = error.message
    res.status(500).json({ message: "Ha habido un error: " + err });
    return;
  }

})

app.post("/modificarcorreu", async (req, res) => {
  try {

    const emailformat = z.email({ error: "Email con formato incorrecto, sigue el formato text@text.text" });
    const resultado = emailformat.safeParse(req.body.noucorreu);

    if (!resultado.success) {
      res.status(400).json({
        message: resultado.error.issues[0].message
      })
      return;
    }

    const comprovar = await comprovacio(req)
    if(comprovar.code !== 200){
      return res.status(comprovar.code).json({message: comprovar.message})
    }

    const antigcorreu = comprovar.dades.correu
    const user = db.collection('unifan').doc(req.body.noucorreu);

    if((await user.get()).exists){
      res.status(409).json({ message: "El usuario " + req.body.noucorreu + " ya está registrado, use otro correo." });
      return;
    }

    const sessionID = crypto.randomBytes(4).readUInt32BE(0).toString()
  
    const token = jwt.sign({noucorreu: req.body.noucorreu, antigcorreu: antigcorreu, sessionID: sessionID}, SECRET_KEY, {expiresIn: "30m"})
    const confirmarLink = `http://localhost:4200/confirmarcambiocorreo?token=${token}`
    await db.collection("unifan").doc("cambiarcorreosessions").set({
        sessions: admin.firestore.FieldValue.arrayUnion(token),
    }, {merge: true})

    await sendMail(
      req.body.correu,
      "Confirmar email",
      `
      <h2>Confirmar cambio de email</h2>
      <p>Haz clic en el siguiente enlace:</p>
      <a href="${confirmarLink}">${confirmarLink}</a>
      `
    );

    res.status(201).json({ mensaje: "Un enlace de verificacion ha sido mandado a su correo" });
    return;
  } catch (error) {
    const err = error.message
    res.status(500).json({ message: "Hi ha hagut un error: " + err });
    return;
  }

})

app.patch("/fermodificaciocorreu", async (req, res) => {
  try {
  
  const info = jwt.verify(req.body.token, SECRET_KEY)
  const tempTokens = db.collection("unifan").doc("cambiarcorreosessions")
  const activeSessions = (await tempTokens.get()).data().sessions

  if(!req.body.token || !activeSessions.includes(req.body.token)){
    return res.status(403).send({message: "Token invalido o no existente"})
  }

  const noucorreu = info.noucorreu;
  const antigcorreu = info.antigcorreu

  const docAnticRef = db.collection("unifan").doc(antigcorreu);
  const docNouRef = db.collection("unifan").doc(noucorreu);

  await db.collection("unifan").doc("cambiarcorreosessions").update({
      sessions: admin.firestore.FieldValue.arrayRemove(req.body.token)
  });

    const dades = (await docAnticRef.get()).data()

    dades.correu = noucorreu;

    await docNouRef.set(dades);

    await docAnticRef.delete();

    await limpiarSessionID(noucorreu);

  res.status(201).json({ mensaje: "Correo " + antigcorreu + " cambiado a " + noucorreu });
  } catch (error) {
    const err = error.message
    res.status(500).json({ message: "Ha habido un error: " + err });
    return;
  }
})

async function cambiarContraseña(correo, nuevaPasswd){
  const cambiaruser = db.collection("unifan").doc(correo)
  await cambiaruser.set({passwd: nuevaPasswd, sessionID: []}, {merge: true})
}

//Aqui se ve el 4.1 de la investigación, cambiar contraseña
app.post("/cambiarpasswd", async (req, res) => {
  try {
    const stringFormat = z.string()
    .refine(campo => campo.trim().length > 0, {
    error: "La contraseña no puede estar vacía"
    })
    .regex(/[A-Z]/, {error: "Debe tener una mayúscula"})
    .regex(/[0-9]/, {error: "Debe tener un número"})

    const resultado = stringFormat.safeParse(req.body.nuevaPasswd);

    if (!resultado.success) {
      res.status(400).json({
        message: resultado.error.issues[0].message
      })
      return;
    }

    const comprovar = await comprovacio(req)

    if(comprovar.code !== 200){
      return res.status(comprovar.code).json({message: comprovar.message})
    }

    await cambiarContraseña(comprovar.dades.correu, req.body.nuevaPasswd)
    
    res.status(200).send({mensaje: "Contraseña cambiada correctamente"})

  } catch (error) {
    const err = error.message
    res.status(500).json({ message: "Ha habido un error: " + err });
    return;
  }
})

app.post("/mandarlinkolvidarpasswd", async (req, res) => {
  try {

  const user = await db.collection("unifan").doc(req.body.correu).get()
  if(!user.exists) return res.status(404).send({message: "El usuario no existe"})

  const randomNumbers = crypto.randomBytes(4).readUInt32BE(0).toString()
  
  const tokenJSON = {
    tokenID: randomNumbers,
    correu: req.body.correu
  }

  const temporalToken = jwt.sign(tokenJSON, SECRET_KEY, {expiresIn: "30m"})

  const resetLink = `http://localhost:4200/fernovapasswd?token=${temporalToken}`

  await db.collection("unifan").doc("temporaltokens").set({sessions: admin.firestore.FieldValue.arrayUnion(temporalToken)}, 
  {merge: true})

  await sendMail(
      req.body.correu,
      "Cambio de contraseña",
      `
      <h2>Cambiar contraseña</h2>
      <p>Haz clic en el siguiente enlace para cambiar tu contraseña:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Este enlace expirará en 30 minutos.</p>
      <p>No compartas esto a nadie.</p>
      `
  );

  res.status(200).send({mensaje: "Se ha enviado un enlace a tu correo"})

  } catch (error) {
    const err = error.message
    res.status(500).json({ message: "Ha habido un error: " + err });
    return;
  }
})


app.post("/actualitzarpasswd", async (req, res) => {
  try {

    const stringFormat = z.string()
    .refine(campo => campo.trim().length > 0, {
    error: "La contraseña no puede estar vacía"
    })
    .regex(/[A-Z]/, {error: "Debe tener una mayúscula"})
    .regex(/[0-9]/, {error: "Debe tener un número"})

    const resultado = stringFormat.safeParse(req.body.nuevaPasswd);

    if (!resultado.success) {
      res.status(400).json({
        message: resultado.error.issues[0].message
      })
      return;
    }

    const tempTokens = db.collection("unifan").doc("temporaltokens")
    const sessions = (await tempTokens.get()).data().sessions

    if (!req.body.token || !sessions.includes(req.body.token)) {
      return res.status(403).send({message: "Token invalido o no existente"})
    }

    const token = jwt.verify(req.body.token, SECRET_KEY)

    await cambiarContraseña(token.correu, req.body.nuevaPasswd)

    await db.collection("unifan").doc("temporaltokens").update({
      sessions: admin.firestore.FieldValue.arrayRemove(req.body.token)
    });

    res.status(200).send({mensaje: "Contraseña cambiada con exito, inicie sesión"})
  } catch (error) {
    const err = error.message
    res.status(500).json({ message: "Ha habido un error: " + err });
    return;
  }

})


app.get("/demanarproductes", async (req, res) => {

  try {

    const productos = await models.Products.findAll({raw: true});
    const productosAgrupados = productos.reduce((acc, prod) => {
    const key = prod.categoria;

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(prod);
      return acc;
    }, {});

    res.status(200).send({productos: productosAgrupados})

  } catch (error) {
    const err = error.message
    res.status(500).json({ message: "Ha habido un error: " + err });
    return;
  }  

})

const productoCestaSchema = z.object({
  id: z.coerce.number().int().positive(),
  foto: z.string(),
  nom: z.string(),
  quantitatcomprada: z.coerce.number().int().positive(),
  preutotal: z.coerce.number().positive(),
  preuperunitat: z.coerce.number().positive()
});

const registrarCompraSchema = z.array(productoCestaSchema);

app.post("/registrarcompra", async (req, res) => {
  try {

    const result = registrarCompraSchema.safeParse(req.body.productos);
    if (!result.success) {
      const errorTree = z.treeifyError(result.error);
      const error = Object.keys(errorTree.properties)[0]

      res.status(400).json({message: "Error: " + errorTree.properties[error].errors[0]});
      return;
    }

    const cesta = result.data;

    const comprovar = await comprovacio(req)

    if(comprovar.code !== 200){
      return res.status(comprovar.code).json({message: comprovar.message})
    }

    const idCompra = crypto.randomUUID()

      await Promise.all(
      cesta.map(async (producto) => {

        const { rows } = await dbcon.query(
          'SELECT * FROM unifan.products WHERE id = $1',
          [producto.id]
        );

        if (rows.length === 0) {
          throw new Error("Producto no encontrado");
        }

        const product = rows[0];

        await dbcon.query(
        `INSERT INTO unifan.historial_productes(user_email, producto_id, cantidad, oferta, id_compra)
        VALUES ($1, $2, $3, $4, $5)`,
        [
          comprovar.dades.correu,
          producto.id,
          producto.quantitatcomprada,
          product.oferta,
          idCompra
        ]
      );
      })
    ); 

    res.status(200).send({
      mensaje: "Gracias por tu compra!"
    })

    return

  } catch (error) {
    const err = error.message
    res.status(500).json({ message: "Ha habido un error: " + err });
    return;
  }
})


app.get("/adminpanel", async (req, res) => {
  try {
    const comprovar = await comprovacio(req)

    if(comprovar.code !== 200){
      return res.status(comprovar.code).json({message: comprovar.message})
    }
    
    if((await comprovar.user.get()).data().role != "Admin"){
      res.status(403).send({
        message: "No eres admin, no tienes permiso para entrar aqui"
      })
    }

    const historial = await models.HistorialProductes.findAll();

    res.status(200).send({historial: historial})
  } catch (error) {
    const err = error.message
    res.status(500).json({ message: "Ha habido un error: " + err });
    return;
  }
})

app.get("/demanarimagen", async (req, res) => {

  try {
      const ruta = req.query.img

      res.status(200).sendFile(path.join(__dirname, "assets", "img", ruta))
      

  } catch (error) {
    const err = error.message
    res.status(500).json({ message: "Ha habido un error: " + err });
    return;
  }
})

app.use("/modelia", express.static(path.join(__dirname, "assets", "modelia")));