const express = require("express");
const app = express();
const mongoose = require("mongoose");
const listing = require("./models/listing.js");
const ejs = require("ejs"); 
const path = require("path");
const ejsmate = require("ejs-mate");
const methodOverride = require("method-override");

// Set up ejs-mate as the engine first
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


// listing all route
app.get("/listing", async(req, res) => {
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
app.get("/listing/:id", async(req, res) => {
    try {
        let {id} = req.params;
        let data = await listing.findById(id);
        res.render("listing/show.ejs", {data});
    } catch (err) {
        console.log(err);
        res.status(500).send("Error loading listing");
    }
});

//Add new Data 
app.post("/listing",async(req,res)=>{
    
  
    const newlisting = new listing(req.body.listing);
    await newlisting.save();
   
    res.redirect("/listing");
});


//update request route 
app.get("/listing/:id/edit", async (req, res) => {
   
    try {
        let {id} = req.params;
        const getdata = await listing.findById(id);
        if (!getdata) {
            return res.status(404).send("Listing not found");
        }
        res.render("listing/edit.ejs", { getdata });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error loading edit form");
    }
});

// update route 
app.put("/listing/:id", (req,res)=>{
        let {id}= req.params;
        const updatedlisting = req.body.listing;
        listing.findByIdAndUpdate(id, updatedlisting, {new: true})
            .then((updatedlisting) => {
                res.redirect(`/listing/${id}`);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send("Error updating listing");
            });
});

// delete route 

app.delete("/listing/:id",async(req,res)=>{
    let {id}= req.params;
   await listing.findByIdAndDelete(id);
    res.redirect("/listing");
});