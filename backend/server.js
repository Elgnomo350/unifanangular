const express = require('express');
const cors = require('cors');
const z = require('zod')
const app = express();
const admin = require('firebase-admin');
const serviceAccount = require('./clave.json');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { tr } = require('zod/v4/locales');
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

const SECRET_KEY = process.env.SECRET_KEY; 

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
    
    const payload = {
      nom: nom,
      cognom: cognom,
      correu: correu,
      direccio: direccio,
      telefon: telefon
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
    res.status(500).json({ message: "Hi ha hagut un error: " + err });
    return;
    }

})

app.get('/loggedin', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({message: "mi bombo"})
   
  try {
    const dades = jwt.verify(token, SECRET_KEY);
    res.cookie('token', token, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 1000 * 60 * 60 * 24 * 7
    })
    res.json({ usuario: dades });
    return
  } catch (err) {
    res.status(401).json({ mensaje: 'Token inválido' });
    return
  } 
});



