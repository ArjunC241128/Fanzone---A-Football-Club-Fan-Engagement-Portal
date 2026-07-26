import express from "express";
import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import chatRouter from "./routes/chat.js";

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());
app.use("/api", chatRouter);

// Put your real connection string in a .env file as MONGODB_URI=... (never commit .env)
// Example: MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/?appName=TITANBOT
const uri = process.env.MONGODB_URI;

// ---------------- Mongoose connection (used by chatRouter / any Mongoose models) ----------------
const connectDB = async () => {
    try {
        await mongoose.connect(uri);
        console.log("Connected with Database! (Mongoose)");
    } catch (err) {
        console.log("Failed to connect with Db", err);
    }
};

// ---------------- Native MongoDB driver connection (used by the Matches/Players/News CRUD below) ----------------
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const titanbotDB = client.db("TITANBOT_Database");
        const matchCollection = titanbotDB.collection("Matches");
        const playerCollection = titanbotDB.collection("Players");
        const newsCollection = titanbotDB.collection("News");
        const bookingCollection = titanbotDB.collection("Bookings");
        const reviewCollection = titanbotDB.collection("Reviews");
        const userCollection = titanbotDB.collection("Users");

        // ---------------- MATCHES ----------------
        app.post('/matches', async (req, res) => {
            const data = req.body;
            const result = await matchCollection.insertOne(data);
            res.send(result)
        })

        app.get('/matches', async (req, res) => {
            const cursor = matchCollection.find();
            const allValues = await cursor.toArray();
            res.send(allValues)
        })

        app.get('/matches/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) };
            const match = await matchCollection.findOne(query);
            res.send(match)
        })

        app.get('/updateMatch/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) };
            const match = await matchCollection.findOne(query);
            res.send(match)
        })

        app.put('/matches/:id', async (req, res) => {
            const id = req.params.id
            const body = req.body
            console.log(body)
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    opponent: body.opponent,
                    competition: body.competition,
                    date: body.date,
                    time: body.time,
                    venue: body.venue,
                    home: body.home,
                    status: body.status,
                    homeScore: body.homeScore,
                    awayScore: body.awayScore,
                },
            };
            const result = await matchCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        app.delete("/matches/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) };
            const result = await matchCollection.deleteOne(query);
            res.send(result)
        })

        // ---------------- PLAYERS ----------------
        app.post('/players', async (req, res) => {
            const data = req.body;
            const result = await playerCollection.insertOne(data);
            res.send(result)
        })

        app.get('/players', async (req, res) => {
            const cursor = playerCollection.find();
            const allValues = await cursor.toArray();
            res.send(allValues)
        })

        app.get('/players/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) };
            const player = await playerCollection.findOne(query);
            res.send(player)
        })

        app.get('/updatePlayer/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) };
            const player = await playerCollection.findOne(query);
            res.send(player)
        })

        app.put('/players/:id', async (req, res) => {
            const id = req.params.id
            const body = req.body
            console.log(body)
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: body.name,
                    position: body.position,
                    number: body.number,
                    dob: body.dob,
                    status: body.status,
                    bio: body.bio,
                },
            };
            const result = await playerCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        app.delete("/players/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) };
            const result = await playerCollection.deleteOne(query);
            res.send(result)
        })

        // ---------------- NEWS ----------------
        app.post('/news', async (req, res) => {
            const data = req.body;
            // New posts start with zero views so "Most Popular" sorting has a value to read.
            const result = await newsCollection.insertOne({ views: 0, ...data });
            res.send(result)
        })

        app.get('/news', async (req, res) => {
            const cursor = newsCollection.find();
            const allValues = await cursor.toArray();
            res.send(allValues)
        })

        app.get('/news/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) };
            const post = await newsCollection.findOne(query);
            res.send(post)
        })

        app.get('/updateNews/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) };
            const post = await newsCollection.findOne(query);
            res.send(post)
        })

        app.put('/news/:id', async (req, res) => {
            const id = req.params.id
            const body = req.body
            console.log(body)
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    title: body.title,
                    tag: body.tag,
                    date: body.date,
                    excerpt: body.excerpt,
                    body: body.body,
                },
            };
            const result = await newsCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        // Bumps a news post's view count by 1. Called by the fan-facing News page
        // whenever someone opens a post's full article — this is what "Most Popular"
        // sorting reads from.
        app.patch('/news/:id/view', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) };
            const updateDoc = { $inc: { views: 1 } };
            const result = await newsCollection.updateOne(filter, updateDoc);
            res.send(result)
        })

        app.delete("/news/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) };
            const result = await newsCollection.deleteOne(query);
            res.send(result)
        })

        // ---------------- BOOKINGS / RSVPs (fan side, read for admin) ----------------
        app.post('/bookings', async (req, res) => {
            const data = req.body;
            const result = await bookingCollection.insertOne(data);
            res.send(result)
        })

        app.get('/bookings', async (req, res) => {
            const cursor = bookingCollection.find();
            const allValues = await cursor.toArray();
            res.send(allValues)
        })

        // ---------------- REVIEWS / FEEDBACK (fan side, read for admin) ----------------
        app.post('/reviews', async (req, res) => {
            const data = req.body;
            const result = await reviewCollection.insertOne(data);
            res.send(result)
        })

        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find();
            const allValues = await cursor.toArray();
            res.send(allValues)
        })

        // Moderate a review: set status to "pending" | "published" | "hidden"
        app.patch('/reviews/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: req.body.status
                },
            };
            const result = await reviewCollection.updateOne(filter, updateDoc);
            res.send(result)
        })

        app.delete("/reviews/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result)
        })

        // ---------------- USERS (role management) ----------------
        app.get('/users', async (req, res) => {
            const cursor = userCollection.find();
            const allValues = await cursor.toArray();
            res.send(allValues)
        })

        // Set a user's role, e.g. { "role": "admin" } to promote or { "role": "fan" } to revoke
        app.patch('/users/:id/role', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: req.body.role
                },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result)
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Titans Fanzone Server Running')
})

app.listen(port, () => {
    console.log(`Running Titans Fanzone Server Successfully on Port Number ${port}`);
    connectDB();
})