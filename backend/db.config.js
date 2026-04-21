const {Sequelize} = require("sequelize")

const configBBDD = () => { 
  return new Sequelize(process.env.DATABASE_URI, {
  dialect: process.env.DB_DIALECT,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
  },
  logging: false
});
}

module.exports = {configBBDD}

