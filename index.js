const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        res.status(401).send({message: 'Unauthorize Access'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            res.status(401).send({message: 'Unauthorize Access'})
        }
        req.decoded = decoded;
        next()
    })
}

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.jh5ecod.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try{
        const photographyServices = client.db('serviceReview').collection('services')
        const reviewsCollection = client.db('serviceReview').collection('reviews')

        app.get('/services', async(req, res) => {
            const query = {}
            const cursor = photographyServices.find(query).sort({_id: -1})
            const services = await cursor.toArray()
            res.send(services)
        })

        app.get('/service/:id', async(req, res) => {
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const service = await photographyServices.findOne(query)
            res.send(service)
        })

        app.post('/services', async(req, res) => {
            const service = req.body
            const result = await photographyServices.insertOne(service)
            res.send(result)
        })

        //review collection

        app.post('/jwt', (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'})
            res.send({token})
        })

        app.get('/reviews', async(req, res) => {
            let query = {}
            if(req.query.itemId){
                query = {
                    itemId: req.query.itemId
                }
            }
            const cursor = reviewsCollection.find(query).sort({time: -1})
            const reviews = await cursor.toArray()
            // console.log(reviews)
            res.send(reviews)
        })

        app.get('/myreviews', verifyJWT, async(req, res) => {
            const decoded = req.decoded
            if(decoded.email !== req.query.email){
                res.status(403).send({message: 'Forbidden Access'})
            }
            let query = {}
            if(req.query.email){
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewsCollection.find(query)
            const myReviews = await cursor.toArray()
            // console.log(reviews)
            res.send(myReviews)
        })

        app.get('/myreviews/:id', async(req, res) => {
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const result = await reviewsCollection.findOne(query)
            res.send(result)
        })

        app.post('/reviews', async(req, res) => {
            const reviews = req.body
            const result = await reviewsCollection.insertOne(reviews)
            res.send(result)
        })

        //reviews update API
        app.put('/myreviews/:id', async(req, res) => {
            const id = req.params.id
            const filter = {_id: ObjectId(id)}
            const reviews = req.body
            // console.log(reviews)
            const option = {upsert: true}
            const updateReviews = {
                $set: {
                    message: reviews.message
                }
            }
            const result = await reviewsCollection.updateOne(filter, updateReviews, option);
            
            res.send(result)
        })

        // reviews deleted API
        app.delete('/myreviews/:id', async(req, res) => {
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const result = await reviewsCollection.deleteOne(query)
            res.send(result)
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