const express = require("express");
const router = express.Router();
const listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
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
router.get("/", async (req, res) => {
    const listings = await listing.find({});
    res.render("listing/index.ejs", { allListings: listings, success: req.flash("success") });
});

// new route
router.get("/new", (req, res) => {
    res.render("listing/new.ejs"); 
});

//show route 
router.get("/:id", wrapAsync(async(req, res) => {
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

// Post route
router.post("/", wrapAsync(async(req, res, next) => {
    const newlisting = new listing(req.body.listing);

    await newlisting.save(); 
    req.flash("success","New listing Created!"); // Corrected spelling
    res.redirect("/listing");
}));


// Edit route
router.get("/:id/edit", wrapAsync(async (req, res) => {
   
 
        let {id} = req.params;
        const getdata = await listing.findById(id);
        if (!getdata) {
            return res.status(404).send("Listing not found");
        }
        res.render("listing/edit.ejs", { getdata });
    
}));

// Update route
router.put("/:id", validatelisting, wrapAsync(async(req, res) => {
    let {id} = req.params;
    const updatedlisting = req.body.listing;
    await listing.findByIdAndUpdate(id, updatedlisting, {new: true});
    res.locals.success = req.flash("success","updete listing done!");
    res.redirect(`/listing/${id}`);
}));

// Delete route

// Delete route
router.delete("/:id", wrapAsync(async(req, res) => {
    let {id}= req.params;
   await listing.findByIdAndDelete(id);
   res.locals.success = req.flash(" success","sucessfully delete listing ");
    res.redirect("/listing");
}));


module.exports = router;