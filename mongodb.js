const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

const connectionUrl = 'mongodb://127.0.0.1:27017'
const databaseName = 'Task-manaer'

MongoClient.connect(connectionUrl, { useUnifiedTopology:true }, (error,client) => {
    if(error){
        return console.log('error occured!')
    }

    const db = client.db(databaseName)
    db.collection('user').insertOne({
        name:'subham',
        age:25
    })
})