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
  logging: false
});
}

module.exports = {configBBDD}

