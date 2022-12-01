// located packages

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();

//middle ware
app.use(cors());
app.use(express.json());

//port 
const port = process.env.PORT || 5000;

// setup mongodb 
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.p4fjw31.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//welcome secession
app.get('/',(req,res)=>{
    res.send('Hello from express')
})


async function runMongodb() {
    try {
        // await client.connect();
        // console.log('client connect successfully')
        const categories = await client.db('Categories').collection('productCategories');
        const users = await client.db('AllUsers').collection('Users');
        const products = await client.db('AllProducts').collection('Products');
        //categories 
        app.get('/productCategories', async (req, res) => {
            const query = {}
            const getCategories = await categories.find(query).toArray();
            res.send(getCategories);
        })

        //save user data in data base

        app.post('/saveUser', async (req, res) => {
            const user = req.body;
            const saveUsers = await users.insertOne(user);
            res.send(saveUsers);
        })

        //get all sellers
        app.get('/all-sellers', async (req, res) => {
            const query = { "role": "Selling" };
            const allSellers = await users.find(query).toArray();
            res.send(allSellers);
        })

        //get all buyers
        app.get('/all-buyers', async (req, res) => {
            const query = { "role": "Buying" };
            const allBuyers = await users.find(query).toArray();
            res.send(allBuyers);
        })

        //load data by category
        app.get('/get-product/:category', async (req, res)=>{
            const category = req.params.category;
            const query = {"categoryId":category}
            const findDataByCategory = await products.find(query).toArray();
            res.send(findDataByCategory)
        })

        //get user data by email
        app.get('/user', async (req, res) => {
            const userEmail = req.query;
            if (userEmail) {
                const getUser = await users.find({ userEmail: userEmail.email }).toArray();
                res.send(getUser)
            }
        })

        // add a product 
        app.post('/addProduct', async (req, res) => {
            const product = req.body;
            const saveProduct = await products.insertOne(product);
            res.send(saveProduct)
        })

        //get all product
        app.get('/product-by-user', async (req, res) => {
            const userEmail = req.query;
            const query = { "userEmail": userEmail.email }
            const findData = await products.find(query).toArray();
            res.send(findData)
        })

        //update product status
        app.put('/update-product-status',async (req, res)=>{
            const data = req.body;
            const query = {"_id":ObjectId(data[1]?.productId)};
            const updateData = await products.updateOne(query, {$set: data[0]}, {upsert:true})
            res.send(updateData)
        })

        //get buyers products
        app.get('/my-product',async(req, res)=>{
            const buyerEmail = req.query;
            const query = {"buyerEmail":buyerEmail.email}
            const findMyProduct = await products.find(query).toArray();
            res.send(findMyProduct);
        })
    }
    catch (err) {
        console.log(err)
    }
    finally {

    }
}
//call function
runMongodb().catch(err => console.log(err));

app.listen(port, () => console.log('server is running port' + port));
