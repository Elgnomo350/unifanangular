const express = require('express');
const cors = require('cors');
const z = require('zod')
const app = express();
const admin = require('firebase-admin');
const serviceAccount = require('./clave.json');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const crypto = require("node:crypto")
require('dotenv').config();

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

app.listen(23000, () => console.log(`listening on http://localhost:${23000}`));

const usuarioSchema = z.object({
  nom: z.string(),
  cognom: z.string(),
  correu: z.string().email(),
  passwd: z.string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe tener una mayúscula")
    .regex(/[0-9]/, "Debe tener un número"),
  direccio: z.string(),
  telefon: z.string().regex(/^[0-9]{9}$/, "Teléfono inválido")
});

app.post("/registrar", async (req, res) => {
    console.log(req.body)
    const result = usuarioSchema.safeParse(req.body);

    if (!result.success) {
    return res.status(400).json({
      error: result.error.errors
    });
  }
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
  }),});


  const usuarioIniciarSesion = z.object({
  correu: z.email({error: "Email con formato incorrecto, sigue el formato text@text.text"}),
  passwd: z.string({error: "Has puesto algo invalido como contraseña."})
});

const SECRET_KEY = process.env.SECRET_KEY; 


async function comprovacio(request){

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

}

app.post("/registrar", async (req, res) => {
    const result = usuarioSchema.safeParse(req.body);

     if (!result.success) {
      const errorTree = z.treeifyError(result.error);
      const error = Object.keys(errorTree.properties)[0]

      res.status(400).json({message: "Error: " + errorTree.properties[error].errors[0]});
      return;
    }

  const { nom, cognom, correu, passwd, direccio, telefon } = result.data;

  try {
      const user = db.collection('unifan').doc(correu);

      if((await user.get()).exists){
      res.status(409).json({ message: "El usuario " + correu + " ya está registrado, use otro correo." });
      return;
      }

      await user.set({
      nom: nom,
      cognom: cognom,
      correu: correu,
      passwd: passwd,
      direccio: direccio,
      telefon: telefon
    });

    res.status(201).json({ mensaje: "Usuario " + correu + " registrado" });
    return;
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

    const { nom, cognom, correu, passwd, direccio, telefon } = userData;
    
    
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
      sessionID: sessionID
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
    
    const { code, token, dades, activeSessions, user } = comprovar

    res.cookie('token', token, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 1000 * 60 * 60 * 24 * 7
    })

    res.status(200).json({ usuario: dades });
    return 

  } catch (error) {
    const err = error.message
    res.status(500).json({ message: "Ha habido un error: " + err });
    return;
  } 
});


app.post("/cerrarsesion", async (req, res) => {
    
  try {

    const comprovar = await comprovacio(req)

    if(comprovar.code !== 200){
      return res.status(comprovar.code).json({message: comprovar.message})
    }
    
    const { code, token, dades, activeSessions, user } = comprovar

    const updatedSessions = activeSessions.filter(s => s !== dades.sessionID);
    await user.update({ activeSessions: updatedSessions });

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

    const { code, token, dades, activeSessions, user } = comprovar

    db.collection("unifan").doc(dades.correu).delete().then(() => {
    return res.status(200).json({mensaje: "Cuenta " + dades.correu + " eliminada correctamente"})
  })

  } catch (error) {
    const err = error.message
    res.status(500).json({ message: "Ha habido un error: " + err });
    return;
  }
})




