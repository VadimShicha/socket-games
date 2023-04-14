const config = require("./config");
const {MongoClient} = require("mongodb");
const client = new MongoClient(process.env.MONGO_URL);

let dbName = config.database;

client.connect();

exports.setDatabaseName = function(newDbName)
{
    dbName = newDbName;
};

exports.insertOne = async function(table, item)
{
    await client.db(dbName).collection(table).insertOne(item);
};

exports.updateOne = async function(table, filterItem, updateItem)
{
    await client.db(dbName).collection(table).updateOne(filterItem, updateItem);
};

exports.findOne = async function(table, item)
{
    return await client.db(dbName).collection(table).findOne(item);
};

exports.deleteOne = async function(table, item)
{
    return await client.db(dbName).collection(table).deleteOne(item);
};

exports.deleteMany = async function(table, item)
{
    return await client.db(dbName).collection(table).deleteMany(item);
};