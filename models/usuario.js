var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var usuario = sequelize.define('usuario', {
    idUsuario: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: type.STRING,
    username: { type: type.STRING, unique: 'usuarioIndex1' },
    password: type.STRING,
    email: { type: type.STRING, unique: 'usuarioIndex2' },
    idBuk: { type: type.INTEGER, unique: 'usuarioIndex3' }
});

// sequelize.sync({ alter: true })
//     .then(dat=>{console.log("Alter usuario ok")})
//     .catch(err=>{console.log("Alter usuario ok")})


sequelize.sync();

module.exports = usuario;