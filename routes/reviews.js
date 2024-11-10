const express = require('express');
const router = express.Router({mergeParams:true});
const wrapAsync = require('../utils/wrapAsync.js');
const expressErrors = require('../utils/expressErrors.js');
const { reviewSchema } = require('../schema.js');
const Listing = require('../models/listings.js');
const Review = require('../models/review.js');


//server side Review validation
const validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new expressErrors(400, msg);
    } else {
        next();
    }
};

// Post review
router.post('/', validateReview, wrapAsync( async(req,res)=>{
    const listing = await Listing.findById(req.params.id);
    const newReview = await new Review(req.body.review);
    
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