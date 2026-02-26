const express = require('express');
const cors = require('cors');
const z = require('zod')
const app = express();
const admin = require('firebase-admin');
const serviceAccount = require('./clave.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
app.use(cors());
app.use(express.json());

app.listen(23000, () => console.log(`listening on http://localhost:${23000}`));

async function test() {
  const snapshot = await db.collection('test').get();
  console.log(snapshot.docs.map(doc => doc.data()));
}

test().catch(console.error);

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
      await db.collection('unifan').doc(correu).set({
      nom: nom,
      cognom: cognom,
      correu: correu,
      password: passwd,
      direccio: direccio,
      telefon: telefon
    });

    res.status(201).json({ mensaje: "Usuari " + correu + " registrat" });
  } catch (error) {
    const err = error.message
    res.status(500).json({ message: "Hi ha hagut un error: " + err });
  }

})



