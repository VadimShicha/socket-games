const mysql = require("mysql");
const config = require("./config");
const credentials = require("./credentials");

let pool = mysql.createPool({
    host: credentials.sqlHost,
    port: credentials.sqlPort,
    user: credentials.sqlUser,
    password: credentials.sqlPassword,
    database: config.database,
    connectionLimit: 10000
});

//returns false if the string has a char missing from look for string else true
exports.isStringLegal = function(str, lookForStr)
{
    for(let i = 0; i < str.length; i++)
        if(!lookForStr.includes(str[i]))
            return false
    return true
}

//run a SQL query with a callback
exports.runSQL = function(cmd, callback)
{
    pool.getConnection(function(err, connection)
    {
        if(err)
        {
            console.log("Error getting connection from pool (" + err + ")");
            return;
        }

        connection.query(cmd, function(err, data, fields)
        {
            connection.release();

            if(err)
                callback(true, err);
            else
                callback(null, data);
        });
    });
}

//get a cookie value by the id with a cookie string
exports.parseCookie = function(cookieStr, id)
{
    if(!cookieStr)
        return null;

    let cookies = cookieStr.toString().replace(/ /g, '').split(';');

    for(let i = 0; i < cookies.length; i++)
    {
        let indexCookie = cookies[i].split('=');
        if(indexCookie[0] == id)
            return indexCookie[1];
    }

    return null;
}