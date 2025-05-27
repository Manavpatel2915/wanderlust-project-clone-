const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const ejs = require("ejs"); 
const path = require("path");
const ejsmate = require("ejs-mate");
const methodOverride = require("method-override");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");
const ejsMate = require('ejs-mate');

// Import routes
const userRoutes = require("./routes/user.js");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

// Configure view engine
app.engine('ejs', ejsmate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Session configuration
const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
}

// Middleware setup - in correct order
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(session(sessionOptions));
app.use(flash());

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash middleware - MUST be after session and flash initialization
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// Mount routes AFTER all middleware is set up
app.use("/listing", listings);
app.use("/listing/:id/review", reviews);
app.use("/", userRoutes);

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

// app.get("/demouser" , async(req,res)=>{
//     let fakeuser = new User({
//         email:"studnet@gmail.com",
//         username:"student"
//     });
//   let newuser= await user.register(fakeuser,"student123");
//     res.send(newuser);
// });




app.use((req,res,next)=>{
    // res.locals.currentUser = req.session.user;
    res.locals.success = req.flash("success");
    // res.locals.error = req.flash("error");
    next();
});

app.use("/listing",listings);
app.use("/listing/:id/review", reviews);
app.use("/", userRoutes);



// app.all("*",(req,res,next)=>{
//     next(new ExpressError(404,"page not found"));
// });


app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("listing/error", { error: message });
});


