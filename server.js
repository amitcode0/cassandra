const express = require("express");
const cassandra = require("cassandra-driver");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve frontend

// Cassandra connection
const client = new cassandra.Client({
  contactPoints: ["127.0.0.1"],
  localDataCenter: "datacenter1",
  keyspace: "mydb",
});

// Connect and ensure table
client
  .connect()
  .then(() => {
    console.log("Connected to Cassandra");
    return client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        name TEXT,
        email TEXT
      );
    `);
  })
  .then(() => {
    console.log("Table ensured.");
  })
  .catch((err) => {
    console.error("Cassandra connection error:", err);
  });

// API Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/users", async (req, res) => {
  try {
    const result = await client.execute("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/user", async (req, res) => {
  const { name, email } = req.body;
  const id = uuidv4();

  try {
    await client.execute(
      "INSERT INTO users (id, name, email) VALUES (?, ?, ?)",
      [id, name, email],
      { prepare: true }
    );
    res.send("User inserted");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
