var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var compliance = sequelize.define('compliance', {
    idCompliance: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cartaOfertaId: {type: type.INTEGER, unique: 'complianceIndex1'},
    payLoad: 'NVARCHAR(MAX)'
});
sequelize.sync();

module.exports = compliance;