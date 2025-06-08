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
  
    const listingsWithOwner = data.data.map((obj) => ({...obj, owner: "652d0081ae547c5d37e56b5f"}));
    await listing.insertMany(listingsWithOwner);
    console.log("data is inserted successfully!");
}

insertData();