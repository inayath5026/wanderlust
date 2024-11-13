const express = require('express');
const router = express.Router({mergeParams:true});
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require('../models/listings.js');
const Review = require('../models/review.js');
const {validateReview, isLoggedIn} = require('../middlewares.js');


// Post review
router.post('/', isLoggedIn, validateReview, wrapAsync( async(req,res)=>{
    const listing = await Listing.findById(req.params.id);
    const newReview = await new Review(req.body.review);
    
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Created !");
    res.redirect(`/listings/${listing._id}`);
}));

// Delete review
router.delete('/:reviewId', wrapAsync( async(req, res)=>{
    const {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted !");
    res.redirect(`/listings/${id}`);
}));


module.exports = router;