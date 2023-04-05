const {MongoClient} = require("mongodb");
const client = new MongoClient(process.env.MONGO_URL);

exports.connect = async function()
{
    try
    {
        await client.connect();
    }
    catch
    {
        return -1;
    }
};

exports.disconnect = async function()
{
    //client.co
};