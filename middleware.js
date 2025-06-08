module.exports.isLoggedIn = (req,res,next)=>{
if(!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl; // Fixed typo: orignalUrl → originalUrl
    req.flash("error", "You must be signed in!");
    return res.redirect("/login");
} 
next();
}


module.exports.saveredirecturl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

// Add this to your middleware.js file
module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listingDoc = await require("./models/listing.js").findById(id);
    
    if (!listingDoc) {
        req.flash("error", "Listing not found");
        return res.redirect("/listing");
    }
    
    if (!listingDoc.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to modify this listing");
        return res.redirect(`/listing/${id}`);
    }
    
    next();
};