const express = require("express");
const cors = require("cors");
//const { MongoClient } = require("mongodb");
const { MongoClient, ObjectId } = require("mongodb"); // הוספת ObjectId
require("dotenv").config();

const app = express();
const port = 5501;
const path = require("path");

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

connectDB();

app.post("/cards", async (req, res) => {
  try {
    const newCard = req.body;
    const result = await client
      .db("studio_cards")
      .collection("cards")
      .insertOne(newCard);
    res.status(201).json({ insertedId: result.insertedId });
  } catch (error) {
    console.error("Error inserting card:", error);
    res.status(500).json({ error: "Failed to add card" });
  }
});

app.patch("/cards/:id", async (req, res) => {
  try {
    const cardId = req.params.id;
    const updatedCheckboxes = req.body.checkboxes;

    const result = await client
      .db("studio_cards")
      .collection("cards")
      .updateOne(
        { _id: new ObjectId(cardId) },
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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

app.get("/cards", async (req, res) => {
  try {
    const cards = await client
      .db("studio_cards")
      .collection("cards")
      .find()
      .toArray(); // מצא את כל הכרטיסיות והמיר אותם למערך
    res.status(200).json(cards); // מחזיר את כל הכרטיסיות
  } catch (error) {
    console.error("Error retrieving cards:", error);
    res.status(500).json({ error: "Failed to get cards" });
  }
});

app.delete("/cards/:id", async (req, res) => {
  try {
    const cardId = req.params.id;
    const result = await client
      .db("studio_cards")
      .collection("cards")
      .deleteOne({ _id: new ObjectId(cardId) }); // המרה ל-ObjectId

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Card not found" });
    }

    res.status(200).json({ message: "Card deleted successfully" });
  } catch (error) {
    console.error("Error deleting card:", error);
    res.status(500).json({ error: "Failed to delete card" });
  }
});
