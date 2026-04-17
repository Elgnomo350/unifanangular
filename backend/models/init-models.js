var DataTypes = require("sequelize").DataTypes;
var _HistorialProductes = require("./historialProductes");
var _Products = require("./products");

function initModels(sequelize) {
  var HistorialProductes = _HistorialProductes(sequelize, DataTypes);
  var Products = _Products(sequelize, DataTypes);

  HistorialProductes.belongsTo(Products, { as: "producto", foreignKey: "producto_id"});
  Products.hasMany(HistorialProductes, { as: "historial_productes", foreignKey: "producto_id"});

  return {
    HistorialProductes,
    Products,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
