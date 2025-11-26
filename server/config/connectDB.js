const mongoose = require("mongoose");
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI); 
        console.log("Connected to DB successfully");
    } catch (error) { 
        console.error("Error in connecting to DB:", error.message);
        process.exit(1);
    }
}

module.exports = connectDB;
