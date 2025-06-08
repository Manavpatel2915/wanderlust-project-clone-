const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveredirecturl } = require("../middleware"); 

router.get("/signup", (req, res) => {
    res.render("user/user");
});

router.post("/signup", wrapAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if(err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listing");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));


router.get("/login" , (req,res,)=>{
    res.render("user/login");
});

router.post("/login", saveredirecturl, passport.authenticate("local",{
    failureRedirect:"/login",failureFlash:true
}), wrapAsync(async(req,res,next)=>{
    req.flash("success","Welcome Back to Wanderlust Again!");
    let redirectUrl = res.locals.redirectUrl || "/listing";
    delete req.session.redirectUrl; // Clear the redirect URL from session
    res.redirect(redirectUrl);
}));

router.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Goodbye!");
        res.redirect("/listing");
    });
});
module.exports = router;