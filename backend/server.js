const express = require('express');
const cors = require('cors');
const z = require('zod')
const app = express();
const admin = require('firebase-admin');
const serviceAccount = require("./clave.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
app.use(cors());
app.use(express.json());

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
      res.status(500).json({ mensaje: "Hi ha hagut un error: " + error.message });
  }

})



