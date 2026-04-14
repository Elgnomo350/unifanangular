var DataTypes = require("sequelize").DataTypes;
var _Products = require("./products");

function initModels(sequelize) {
  var Products = _Products(sequelize, DataTypes);


  return {
    Products,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
