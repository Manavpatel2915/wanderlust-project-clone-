const express = require("express");
const router = express.Router();
const listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../scheme.js");

const {isLoggedIn} = require("../middleware.js");


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
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listing/new.ejs"); 
});


// Show route
router.get("/:id", wrapAsync(async(req, res) => {  
    try {
        let {id} = req.params;
        let data = await listing.findById(id)
            .populate('review')
            .populate('owner');
        
        if (!data) {
            req.flash("error", "Listing not found");
            return res.redirect("/listing");
        }
        
        // Safely log owner information if it exists
        if (data.owner) {
            console.log("Owner information:", {
                ownerId: data.owner._id,
                username: data.owner.username || "Not available",
                email: data.owner.email || "Not available"
            });
        } else {
            console.log("No owner information available for this listing");
        }
        
        res.render("listing/show.ejs", {data});
    } catch (err) {
        console.log(err);
        req.flash("error", "Error loading listing");
        res.redirect("/listing");
    }
}));



// Post route
router.post("/", isLoggedIn, wrapAsync(async(req, res, next) => {
    const newlisting = new listing(req.body.listing);
    newlisting.owner = req.user._id; // Set the current user as owner
    await newlisting.save(); 
    req.flash("success","New listing Created!");
    res.redirect("/listing");
}));

// Edit route
// Edit route
router.get("/:id/edit", isLoggedIn, wrapAsync(async (req, res) => {
    let {id} = req.params;
    const getdata = await listing.findById(id);
    
    // Check if listing exists
    if (!getdata) {
        req.flash("error", "Listing not found");
        return res.redirect("/listing");
    }
    
    // Check if current user is the owner
    if (!getdata.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to edit this listing");
        return res.redirect(`/listing/${id}`);
    }
    
    res.render("listing/edit.ejs", { getdata });
}));

// Update route
// Update route
router.put("/:id", isLoggedIn, validatelisting, wrapAsync(async(req, res) => {
    let {id} = req.params;
    
    // Find the listing first
    const listingToUpdate = await listing.findById(id);
    
    // Check if listing exists
    if (!listingToUpdate) {
        req.flash("error", "Listing not found");
        return res.redirect("/listing");
    }
    
    // Check if current user is the owner
    if (!listingToUpdate.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to update this listing");
        return res.redirect(`/listing/${id}`);
    }
    
    const updatedlisting = req.body.listing;
    await listing.findByIdAndUpdate(id, updatedlisting, {new: true});
    req.flash("success", "Update listing done!");
    res.redirect(`/listing/${id}`);
}));

// Delete route
router.delete("/:id", isLoggedIn, wrapAsync(async(req, res) => {
    let {id} = req.params;
    
    // Find the listing first
    const listingToDelete = await listing.findById(id);
    
    // Check if listing exists
    if (!listingToDelete) {
        req.flash("error", "Listing not found");
        return res.redirect("/listing");
    }
    
    // Check if current user is the owner
    if (!listingToDelete.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to delete this listing");
        return res.redirect(`/listing/${id}`);
    }
    
    // If user is the owner, proceed with deletion
    await listing.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted listing");
    res.redirect("/listing");
}));




module.exports = router;