const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.jh5ecod.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try{
        const photographyServices = client.db('serviceReview').collection('services')

        app.get('/serviceshome', async(req, res) => {
            const query = {}
            const cursor = photographyServices.find(query)
            const services = await cursor.limit(3).toArray()
            res.send(services)
        })

        app.get('/services', async(req, res) => {
            const query = {}
            const cursor = photographyServices.find(query)
            const services = await cursor.toArray()
            res.send(services)
        })

        app.get('/serviceDetails/:id', async(req, res) => {
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const service = await photographyServices.findOne(query)
            res.send(service)
        })
        

    }
    finally{

    }
}
run().catch(err => console.log(err))

app.get('/', (req, res) => {
    res.send('service review is running')
})

app.listen(port, () => {
    console.log(`server running on the port ${port}`)
})