const SequelizeAuto = require('sequelize-auto');
require('dotenv').config();

const auto = new SequelizeAuto(process.env.DATABASE_NAME, process.env.DATABASE_USER, process.env.DATABASE_PWD, {
    host: process.env.DATABASE_HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT,
    schema: process.env.DATABASE_SCHEMA,

    directory: './backend/models',
    caseModel: 'p',
    caseFile: 'c',

    additional: {
      timestamps: false
    },

    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

auto.run().then(() => {
    console.log("Modelos generados");
  }).catch(err => {
    console.error("Error:", err);
});