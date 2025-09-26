// simple comments service backed by Mongo
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
app.use(express.json());

const MONGO = process.env.MONGO_URI || "mongodb://mongo-comment:27017";
const DBNAME = process.env.DB_NAME || "commentdb";

let coll;
MongoClient.connect(MONGO, { useUnifiedTopology: true })
  .then(client => {
    coll = client.db(DBNAME).collection("comments");
    console.log("Comment DB connected");
  })
  .catch(err => console.error(err));

app.post("/api/comments", async (req, res) => {
  try {
    const doc = { postId: req.body.postId, userId: req.body.userId, text: req.body.text, createdAt: new Date() };
    const r = await coll.insertOne(doc);
    res.status(201).json({ id: r.insertedId });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

app.get("/api/comments/post/:postId", async (req, res) => {
  const list = await coll.find({ postId: req.params.postId }).toArray();
  res.json(list);
});

app.get("/health", (req, res) => res.json({ service: "comment-service", ok: true }));

const PORT = process.env.PORT || 5102;
app.listen(PORT, () => console.log(`Comment service on ${PORT}`));
