// simple user service (MongoDB)
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(express.json());

const MONGO = process.env.MONGO_URI || "mongodb://mongo-user:27017";
const DBNAME = process.env.DB_NAME || "userdb";
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

let usersColl;

MongoClient.connect(MONGO, { useUnifiedTopology: true })
  .then(client => {
    const db = client.db(DBNAME);
    usersColl = db.collection("users");
    console.log("User DB connected");
  })
  .catch(err => console.error("User DB error:", err));

// register
app.post("/api/users/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email/password required" });
    const exists = await usersColl.findOne({ email });
    if (exists) return res.status(400).json({ error: "user exists" });
    const hash = await bcrypt.hash(password, 10);
    const r = await usersColl.insertOne({ email, password: hash, name });
    res.status(201).json({ id: r.insertedId });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// login
app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await usersColl.findOne({ email });
    if (!user) return res.status(400).json({ error: "invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: "invalid credentials" });
    const token = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get("/health", (req, res) => res.json({ service: "user-service", ok: true }));

const PORT = process.env.PORT || 5101;
app.listen(PORT, () => console.log(`User service running on ${PORT}`));
