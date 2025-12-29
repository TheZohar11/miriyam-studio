//mongodb+srv://maryumastudio:<db_password>@studio.emaob.mongodb.net/?retryWrites=true&w=majority&appName=studio
//mayuma123
const { MongoClient } = require("mongodb");

async function main() {
  const uri =
    "mongodb+srv://maryumastudio:mayuma123@studio.emaob.mongodb.net/?retryWrites=true&w=majority&appName=studio";

  const client = new MongoClient(uri);

  try {
    await client.connect();

    await listDatabases(client);
    await createListing(client, {
      name: "nici loft",
      summary: " very nice loft in israel",
      bedrooms: 1,
      bathrooms: 1,
    });
  } catch (error) {
    console.error(" Connection failed:", error);
  } finally {
    await client.close();
  }
}
main().catch(console.error);

async function createListing(client, newListing) {
  const result = await client
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .insertOne(newListing);

  console.log(`new listing id: ${result.insertedId}`);
}

async function listDatabases(client) {
  const databasesList = await client.db().admin().listDatabases();

  console.log("Databases:");
  databasesList.databases.forEach((db) => {
    console.log(`-${db.name}`);
  });
}
