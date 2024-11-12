const express = require('express');
const router = express.Router({ mergeParams: true });
const User = require('../models/user.js');
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');

router.get('/signup', (req, res) => {
    res.render("users/signup.ejs");
});

router.post('/signup', wrapAsync(async (req, res) => {
    
    try{
        const { username, email, password } = req.body;
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        res.redirect("/listings");
    } catch(err){
        req.flash("error", err.message);
        res.redirect('/signup');
    }

}));

router.get('/login', (req, res)=>{
    res.render('users/login.ejs');
});

router.post('/login', passport.authenticate("local", { failureRedirect : '/login', failureFlash : true }), async(req, res)=>{
    res.redirect('/listings');
});

router.get('/logout', (req, res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "You're Logged Out !");
        res.redirect('/listings');
    });
});

module.exports = router;