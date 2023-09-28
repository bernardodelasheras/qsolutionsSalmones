var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var bukLiquidacion = sequelize.define('bukLiquidacion', {
    liquidacion_id : type.INTEGER,
    person_id : type.INTEGER,
    employee_id : type.INTEGER,
    rut :  type.STRING ,
    month : type.INTEGER,
    year : type.INTEGER,
    worked_days : type.STRING,
    noworked_days : type.STRING,
    income_gross : type.STRING,
    income_net : type.STRING,
    income_afp : type.STRING,
    income_ips : type.STRING,
    total_income_taxable : type.STRING,
    total_income_notaxable : type.STRING,
    total_legal_discounts : type.STRING,
    total_other_discounts : type.STRING,
    closed : type.STRING,
    type :  type.STRING,
    income_type :  type.STRING,
    subtype : type.STRING,
    name :  type.STRING,
    amount : type.INTEGER,
    resettlement : type.STRING,
    taxable : type.STRING,
    imponible : type.STRING,
    anticipo : type.STRING,
    credit_type : type.STRING,
    institution : type.STRING,
    description : type.STRING,
    code :  type.STRING,
    item_code : type.STRING
});

sequelize.sync();

module.exports = bukLiquidacion;