const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingschema = new Schema({
    title: {  // Fixed typo: titel → title
        type: String,
        required: true  // Fixed typo: require → required
    },
    description: String,
    image: {  // Changed from String to object with filename and url
        filename: String,
        url: String
    },
    price: Number,
    location: String,
    country: String
});

const listing = mongoose.model("listing", listingschema);

module.exports = listing;