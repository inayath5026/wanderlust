const express = require('express');
const router = express.Router({mergeParams:true});
const wrapAsync = require('../utils/wrapAsync.js');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middlewares.js');
const reviewController = require('../controllers/reviews.js');

// Post review
router.post('/', isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// Delete review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview));


module.exports = router;