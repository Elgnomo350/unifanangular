const express = require('express');
const cors = require('cors');
const app = express();


app.use(cors());

app.listen(23000, () => console.log(`listening on http://localhost:${23000}`));




