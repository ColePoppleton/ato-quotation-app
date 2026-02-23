// test-db.js
const mongoose = require('mongoose');

// Paste your exact connection string here (ensure password is correct and URL-encoded if needed)
const URI = "mongodb+srv://Test:Test@brightoak.zw9blrn.mongodb.net/ato_management?retryWrites=true&w=majority";

async function runTest() {
    console.log("⏳ Attempting to connect to MongoDB Atlas...");

    try {
        // We set a strict 5-second timeout so it fails quickly if blocked
        await mongoose.connect(URI, { serverSelectionTimeoutMS: 5000 });

        console.log("✅ SUCCESS: Successfully connected to MongoDB Atlas!");

        // Test a quick query to ensure read/write access is active
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`📂 Found ${collections.length} collections in this database.`);

        process.exit(0);
    } catch (error) {
        console.error("\n❌ FAILED: Could not connect to the database.");
        console.error("Error Details:", error.message);
        process.exit(1);
    }
}

runTest();