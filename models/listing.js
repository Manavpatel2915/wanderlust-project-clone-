const mongoose = require("mongoose");
const review = require("./review");
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
    country: String,
    review :[{
        type :Schema.Types.ObjectId,
        ref:"review"
    },
], 
    
    
});


listingschema.post("findOneAndDelete" ,async(listing)=>{
    await review.deleteMany({_id:{$in:listing.review}});
})
const listing = mongoose.model("listing", listingschema);

module.exports = listing;