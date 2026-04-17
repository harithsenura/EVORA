const mongoose = require("mongoose");
require("dotenv").config({ path: "./backend/.env" }); // Explicit path if running from root

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://harithdivarathna:Toolup1@cluster0.srstqba.mongodb.net/evora-ecommerce";

console.log("Testing MongoDB Connection...");
console.log("URI:", MONGODB_URI.replace(/:([^:@]+)@/, ":****@")); // Mask password

mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    // family: 4 // Commented out to test if removing it helps
})
    .then(() => {
        console.log("SUCCESS: Connected to MongoDB!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("ERROR: Failed to connect to MongoDB:", err.message);
        process.exit(1);
    });
