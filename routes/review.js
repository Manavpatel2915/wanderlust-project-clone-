const express = require("express");
const router = express.Router({mergeParams: true});
const listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");  // Fixed import
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema} = require("../scheme.js");
const review = require("../models/review.js");

const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

router.post("/", validateReview, wrapAsync(async(req,res) => {
    let id = await listing.findById(req.params.id);
    let newreview = new review(req.body.review);
    id.review.push(newreview);
    
    await newreview.save();
    await id.save();
    req.flash("success" ,"new Review Added!" );
    res.redirect(`/listing/${id._id}`);
}));

router.delete("/:reviewId", wrapAsync(async (req, res) => {  // Fixed usage here too
    const { id, reviewId } = req.params;
    
    await listing.findByIdAndUpdate(id, { $pull: { review: reviewId } });
   
    await review.findByIdAndDelete(reviewId);
    req.flash("error" ,"Review was deleted!");
    res.redirect(`/listing/${id}`);
}));

module.exports = router;