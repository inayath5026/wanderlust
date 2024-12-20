const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync.js');
const {isLoggedIn, isOwner, validateListing} = require('../middlewares.js');
const listingController = require('../controllers/listings.js');
const multer  = require('multer');
const {storage} = require('../cloudConfig.js');
const upload = multer({ storage });


// Listings Route
router.get('/', wrapAsync(listingController.index));

// New Route
router.get('/new', isLoggedIn, listingController.renderNewForm);

// Show Route
router.get('/:id', wrapAsync(listingController.showListing));

// Create Route
router.post('/', isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.newListing));

// Edit Route
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(listingController.editListing));

// Update Route
router.put('/:id', isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing));

// Delete Route
router.delete('/:id', isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));


module.exports = router;