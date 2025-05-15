const mongoose = require("mongoose");
const data = require("./data.js");
const listing = require("../models/listing.js");

//connection with mongodb
let url = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(url);
}

main()
    .then(() => console.log("wanderlust connected successfully"))
    .catch((err) => {
        console.log(err);
    });

//fill data to wanderlust database 
async function insertData() {
    await listing.deleteMany();
    await listing.insertMany(data.data);
    console.log("data is inserted successfully!");
}

insertData();