const express = require("express");
const app = express();
const mongoose = require("mongoose");

const ejs = require("ejs"); 
const path = require("path");
const ejsmate = require("ejs-mate");
const methodOverride = require("method-override");
const reviews = require("./routes/review.js");

const listings = require("./routes/listing.js");


app.engine('ejs', ejsmate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//  set up  middleware
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

app.use("/listing",listings);
app.use("/listing/:id/review",reviews);

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


