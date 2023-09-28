var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var wf_semaforo = sequelize.define('wf_semaforo', {
    idSemaforo: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    diasLuzAmarilla: type.STRING
});
sequelize.sync();

module.exports = wf_semaforo;
