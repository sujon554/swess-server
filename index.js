const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require("mongodb").ObjectId;
const app = express();
const port =process.env.PORT || 5000;
require('dotenv').config()


app.use(cors());
app.use(express.json());

// mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ad0jo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ad0jo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log(uri)
async function run() {
  try {
    await client.connect();
    console.log("success connect database");
    const database = client.db("swissEagle");
    const watchCollection = database.collection("watches");
    const orderCollection = database.collection("orders");
    const reviewCollection = database.collection("reviews");
    const userCollection = database.collection("users");

    //    *****************
    //   ////////// users **********
    //   *****************

    //POST API For Users
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await userCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

    //Get Users API
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find({});
      const users = await cursor.toArray();
      res.json(users);
    });

    //Upsert
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    //Make Admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      console.log("put", user);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    //Admin Verfication
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //    *****************
    //   ////////// Sujon **********
    //   *****************
    //POST API For Review
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });

    //GET All Orders Review
    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollection.find({});
      const review = await cursor.toArray();
      res.json(review);
    });

    //POST API For Orders
    app.post("/allorders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      console.log(result);
      res.json(result);
    });

    //GET All Orders API
    app.get("/allorders", async (req, res) => {
      const cursor = orderCollection.find({});
      const orders = await cursor.toArray();
      res.json(orders);
    });

    //Delete Single Order From All Orders
    app.delete("/allorders/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Deleted Order", id);
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      console.log("Deleted", result);
      res.json(result);
    });

    //POST watch
    app.post("/watches", async (req, res) => {
      const watch = req.body;
      console.log(watch);
      const result = await watchCollection.insertOne(watch);
      console.log(result);
      res.json(result);
    });

    //GET API
    app.get("/watches", async (req, res) => {
      const cursor = watchCollection.find({});
      const users = await cursor.toArray();
      res.send(users);
    });

    //singleProduct
    app.get("/watches/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Single watch", id);
      const query = { _id: ObjectId(id) };
      const watch = await watchCollection.findOne(query);
      res.json(watch);
    });

    //delete watch from all
    app.delete("/watches/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Deleted product", id);
      const query = { _id: ObjectId(id) };
      const result = await watchCollection.deleteOne(query);
      console.log("Deleted", result);
      res.json(result);
    });

    //Get My Orders by email
    app.get("/myorders", async (req, res) => {
      let query = {};
      const email = req.query.email;
      if (email) {
        query = { userEmail: email };
      }
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.json(orders);
    });

    //Update Approved
    app.put("/updateStatus/:id", (req, res) => {
      const id = req.params.id;
      const updatedStatus = req.body.status;
      const filter = { _id: ObjectId(id) };
      console.log(updatedStatus);
      orderCollection
        .updateOne(filter, {
          $set: { bookedServiceStatus: updatedStatus },
        })
        .then((result) => {
          res.send(result);
          console.log(result);
        });
    });

    //Delete My Orders
    app.delete("/myorders/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Deleted Order", id);
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      console.log("Deleted", result);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);


//root 
app.get('/', (req, res) => {
    res.send('running mt curd');
});

app.listen(port, () => {
    console.log('running server on port', port);
})