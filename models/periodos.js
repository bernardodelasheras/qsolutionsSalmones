var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var periodos = sequelize.define('periodos', {
    id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    periodo: { type: type.INTEGER, unique: 'periodosIndex' }
});
sequelize.sync();

module.exports = periodos;
