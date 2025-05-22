const express = require("express");
const router = express.Router();
const listing = require("../models/listing.js");
const WarpAsync = require("../utils/WarpAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../scheme.js");


const validatelisting = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};
// listing all route
router.get("/", (req, res) => {
    listing.find({})  
        .then((allListings) => {
            res.render("listing/index.ejs", {allListings});
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Error fetching listings");
        });
});

// new route 
router.get("/new", (req, res) => {
    res.render("listing/new.ejs"); 
});

//show route 
router.get("/:id", WarpAsync(async(req, res) => {
    try {
        let {id} = req.params;
        let data = await listing.findById(id).populate('review');
        res.render("listing/show.ejs", {data});
    } catch (err) {
        console.log(err);
        res.status(500).send("Error loading listing");
    }
}));

//Add new Data route

router.post("/", WarpAsync(async(req, res, next) => {
    // if(!req.body.listing){
    //     new ExpressError(400, "Invalid listing data");    
    // }
   
    const { error } = listingSchema.validate(req.body);
    // if(error) {
    //     throw new ExpressError(400, error.details.map(el => el.message).join(','));
    // }
    const newlisting = new listing(req.body.listing);

    await newlisting.save();    res.redirect("/listing");
}));


//update request route 
router.get("/:id/edit", WarpAsync(async (req, res) => {
   
 
        let {id} = req.params;
        const getdata = await listing.findById(id);
        if (!getdata) {
            return res.status(404).send("Listing not found");
        }
        res.render("listing/edit.ejs", { getdata });
    
}));

// update route 
router.put("/:id", validatelisting, WarpAsync(async(req, res) => {
    let {id} = req.params;
    const updatedlisting = req.body.listing;
    await listing.findByIdAndUpdate(id, updatedlisting, {new: true});
    res.redirect(`/listing/${id}`);
}));

// delete route 

router.delete("/:id",WarpAsync(async(req,res)=>{
    let {id}= req.params;
   await listing.findByIdAndDelete(id);
    res.redirect("/listing");
}));


module.exports = router;