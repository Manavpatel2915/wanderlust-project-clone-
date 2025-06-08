const mongoose = require("mongoose");
const User = require("./models/user.js");
const Listing = require("./models/listing.js");

// Connection with MongoDB
let url = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(url);
    console.log("Connected to database");
}

async function updateListingOwners() {
    try {
        // Find an existing user or create a new one
        let user = await User.findOne({});
        
        if (!user) {
            // Create a new user if none exists
            const newUser = new User({
                email: "admin@example.com",
                username: "admin"
            });
            
            // Register the user with passport-local-mongoose
            await User.register(newUser, "password123");
            user = newUser;
            console.log("Created new user:", user);
        } else {
            console.log("Using existing user:", user);
        }
        
        // Update all listings to use this user as owner
        const result = await Listing.updateMany(
            {}, // Match all documents
            { owner: user._id } // Set the owner field to the user's ID
        );
        
        console.log(`Updated ${result.modifiedCount} listings with owner: ${user._id}`);
    } catch (err) {
        console.error("Error updating listings:", err);
    } finally {
        mongoose.connection.close();
    }
}

main()
    .then(() => updateListingOwners())
    .catch(err => {
        console.error("Connection error:", err);
        mongoose.connection.close();
    });