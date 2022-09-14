import * as dotenv  from 'dotenv';
dotenv.config()
import express from 'express';
import connect from './db.js'
import cors from "cors"
import mongo from 'mongodb';
import auth from './auth.js';

const app = express() 
const port =  process.env.PORT ||3000 
app.use(cors())
app.use(express.json());

app.get('/tajna', [auth.verify], async (req, res) => {
    res.status(200).send('tajna korisnika ' + req.jwt.username);
});


app.post('/auth', async (req, res) => {
    let user = req.body;
    let username = user.username;
    let password = user.password;

    try {
        let result = await auth.authenticateUser(username, password);
        res.status(201).json(result);
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
});

app.post('/user', async (req, res) => {
    let user = req.body;

    try {
        let result = await auth.registerUser(user);
        res.status(201).send();
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
    
});



app.post('/oglasi', [auth.verify], async (req, res) => {
    let db = await connect();
    let doc = req.body;



    let result = await db.collection('oglasi').insertOne(doc);

    res.json(doc);
});
app.post('/poruke', [auth.verify], async (req, res) => {
    let db = await connect();
    let doc = req.body;



    let result = await db.collection('poruke').insertOne(doc);

    res.json(doc);
});

app.delete('/poruke/:id', [auth.verify], async (req, res) => {
    let db = await connect();
    let id = req.params.id;

    let result = await db.collection('poruke').deleteMany(
        { artikalid: id})

})

app.post('/upit', [auth.verify], async (req, res) => {
    let db = await connect();
    let doc = req.body;



    let result = await db.collection('upiti').insertOne(doc);

    res.json(doc);
});
app.delete('/upit/:id', [auth.verify], async (req, res) => {
    let db = await connect();
    let id = req.params.id;

    let result = await db.collection('upiti').deleteOne(
        { _id: mongo.ObjectId(id) })

})

app.post('/comments', [auth.verify],  async (req, res) => {
    let db = await connect();
    let doc = req.body;



    let result = await db.collection('komentari').insertOne(doc);

    res.json(doc);
});

app.delete('/oglasi/:id', [auth.verify], async (req, res) => {
    let db = await connect();
    let id = req.params.id;

    let result = await db.collection('oglasi').deleteOne(
        { _id: mongo.ObjectId(id) })

});

app.delete('/comments/:id', [auth.verify], async (req, res) => {
    let db = await connect();
    let id = req.params.id;

    let result = await db.collection('komentari').deleteOne(
        { _id: mongo.ObjectId(id) })

});


app.get('/oglasi', [auth.verify], async (req, res) => {
    let db = await connect() 
    let cursor = await db.collection("oglasi").find()
    let results = await cursor.toArray()
    res.json(results)
   })


app.get('/oglas/:id', [auth.verify],  async (req, res) => {
    let id = (req.params.id).trim();
    let db = await connect();
    let document = await db.collection('oglasi').findOne({_id: new mongo.ObjectID(id)});

    res.json(document);
});

app.get('/upit', [auth.verify], async (req, res) => {
    let db = await connect() 
    let query = req.query
    let cursor = await db.collection("upiti").find({ $or: [ { by: query.by } , { to: query.to} ]})
    let results = await cursor.toArray()
    res.json(results)
    console.log(query.by)
    console.log(query.to)
   })


app.get('/comments/:id', [auth.verify], async (req, res) => {
let db = await connect() 
let id = (req.params.id).trim();
   

let cursor = await db.collection("komentari").find({oglasid: id})
let results = await cursor.toArray()
res.json(results)

})

app.get('/poruke/:id', [auth.verify], async (req, res) => {
    let db = await connect() 
    let id = (req.params.id).trim();
    let query = req.query  
    let cursor = await db.collection("poruke").find({artikalid: id, $and: [ {$or:[ { querysender: query.querysender } , { itemowner: query.itemowner}]}, {$or:[ { querysender: query.querysender2 } , { itemowner: query.itemowner2}]}] })
    let results = await cursor.toArray()
    res.json(results)
    })

app.listen(port, () => console.log(`Slušam na portu ${port}!`))
