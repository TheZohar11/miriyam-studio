const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5501;
const path = require("path");

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const JWT_SECRET = process.env.JWT_SECRET;

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}
connectDB();

function db() {
  return client.db("studio_cards");
}

// ---------- Auth middleware ----------

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token required" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ---------- Auth routes ----------

app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email and password are required" });
    }

    const users = db().collection("users");
    const existing = await users.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await users.insertOne({ name, email, password: hashedPassword });

    const token = jwt.sign(
      { userId: result.insertedId.toString(), email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ token, name, email });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = await db().collection("users").findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ token, name: user.name, email: user.email });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// ---------- Card routes (all protected) ----------

app.get("/cards", authenticateToken, async (req, res) => {
  try {
    const cards = await db()
      .collection("cards")
      .find({ userId: req.user.userId })
      .toArray();
    res.status(200).json(cards);
  } catch (error) {
    console.error("Error retrieving cards:", error);
    res.status(500).json({ error: "Failed to get cards" });
  }
});

app.post("/cards", authenticateToken, async (req, res) => {
  try {
    const newCard = { ...req.body, userId: req.user.userId };
    const result = await db().collection("cards").insertOne(newCard);
    res.status(201).json({ insertedId: result.insertedId });
  } catch (error) {
    console.error("Error inserting card:", error);
    res.status(500).json({ error: "Failed to add card" });
  }
});

app.patch("/cards/:id", authenticateToken, async (req, res) => {
  try {
    const cardId = req.params.id;
    const updatedCheckboxes = req.body.checkboxes;

    const result = await db()
      .collection("cards")
      .updateOne(
        { _id: new ObjectId(cardId), userId: req.user.userId },
        { $set: { checkboxes: updatedCheckboxes } }
      );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Card not found" });
    }

    res.status(200).json({ message: "Card updated successfully" });
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(500).json({ error: "Failed to update card" });
  }
});

app.delete("/cards/:id", authenticateToken, async (req, res) => {
  try {
    const cardId = req.params.id;
    const result = await db()
      .collection("cards")
      .deleteOne({ _id: new ObjectId(cardId), userId: req.user.userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Card not found" });
    }

    res.status(200).json({ message: "Card deleted successfully" });
  } catch (error) {
    console.error("Error deleting card:", error);
    res.status(500).json({ error: "Failed to delete card" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
