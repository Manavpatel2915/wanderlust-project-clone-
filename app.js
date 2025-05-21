const express = require("express");
const app = express();
const mongoose = require("mongoose");
const listing = require("./models/listing.js");
const ejs = require("ejs"); 
const path = require("path");
const ejsmate = require("ejs-mate");
const methodOverride = require("method-override");
const {listingSchema,reviewSchema} = require("./scheme.js"); 
const ExpressError = require("./utils/ExpressError.js");
const WarpAsync = require("./utils/WarpAsync.js");
const review = require("./models/review.js");

app.engine('ejs', ejsmate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Then set up other middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
 
//connect to wanderlust database
let url = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(url);
}
 
main()
    .then(() => console.log("wanderlust connected successfully"))
    .catch((err) => {
        console.log(err);
    });

app.listen(8080, () => {
    console.log("listening at port 8080");
});

app.get("/", (req, res) => {
    res.send("this is wanderlust project");
});

const validatelisting = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// listing all route
app.get("/listing", (req, res) => {
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
app.get("/listing/new", (req, res) => {
    res.render("listing/new.ejs"); 
});

//show route 
app.get("/listing/:id", WarpAsync(async(req, res) => {
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

app.post("/listing", WarpAsync(async(req, res, next) => {
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
app.get("/listing/:id/edit", WarpAsync(async (req, res) => {
   
 
        let {id} = req.params;
        const getdata = await listing.findById(id);
        if (!getdata) {
            return res.status(404).send("Listing not found");
        }
        res.render("listing/edit.ejs", { getdata });
    
}));

// update route 
app.put("/listing/:id", validatelisting, WarpAsync(async(req, res) => {
    let {id} = req.params;
    const updatedlisting = req.body.listing;
    await listing.findByIdAndUpdate(id, updatedlisting, {new: true});
    res.redirect(`/listing/${id}`);
}));

// delete route 

app.delete("/listing/:id",WarpAsync(async(req,res)=>{
    let {id}= req.params;
   await listing.findByIdAndDelete(id);
    res.redirect("/listing");
}));


//  review route 
app.post("/listing/:id/review", validateReview, WarpAsync(async(req,res) => {
    let id = await listing.findById(req.params.id);
    let newreview = new review(req.body.review);
    id.review.push(newreview);
    
    await newreview.save();
    await id.save();
    
    res.redirect(`/listing/${id._id}`);
}));

// Remove or comment out this duplicate route
// app.get("/listing/:id",WarpAsync(async(req,res)=>{
//     let {id} = req.params;
//     const listing = await listing.findById(id).populate('review');
//     res.render("listing/show.ejs",{listing});
// }))


// app.all("*",(req,res,next)=>{
//     next(new ExpressError(404,"page not found"));
// });


app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("listing/error", { error: message });
});

// Delete review route
app.delete("/listing/:id/review/:reviewId", WarpAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  
  // Remove review reference from the listing document
  await listing.findByIdAndUpdate(id, { $pull: { review: reviewId } });
  
  // Delete the review document itself
  await review.findByIdAndDelete(reviewId);
  
  // Redirect back to the listing page
  res.redirect(`/listing/${id}`);
}));

