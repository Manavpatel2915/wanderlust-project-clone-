const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

// Import routes
const userRoutes = require("./routes/user.js");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

// Configure view engine

app.engine('ejs', ejsMate);
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

// Middleware
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

// Flash middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});

// Mount routes
app.use("/listing", listings);
app.use("/listing/:id/review", reviews);
app.use("/", userRoutes);

// Root route
app.get("/", (req, res) => {
    res.send("this is wanderlust project");
});

// Database connection
let url = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(url);
}

main()
    .then(() => console.log("wanderlust connected successfully"))
    .catch((err) => {
        console.log(err);
    });

// Start server
app.listen(8080, () => {
    console.log("listening at port 8080");
});


