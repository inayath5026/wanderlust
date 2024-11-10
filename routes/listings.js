const express = require('express');
const router = express.Router({mergeParams:true});
const wrapAsync = require('../utils/wrapAsync.js');
const expressErrors = require('../utils/expressErrors.js');
const { listingSchema } = require('../schema.js');
const Listing = require('../models/listings.js');

//server side Listing validation
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new expressErrors(400, msg);
    } else {
        next();
    }
};

// Listings Route
router.get('/', wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// New Route
router.get('/new', (req, res) => {
    res.render("listings/new.ejs");
});

// Show Route
router.get('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
        req.flash("error", "Listing does not Exist !");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}));

// Create Route
router.post('/', validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "New Listing Created !");
    res.redirect("/listings");
}));

// Edit Route
router.get('/:id/edit', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing does not Exist !");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}));

// Update Route
router.put('/:id', validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const updatedListing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });
    if (!updatedListing) {
        throw new expressErrors(404, "Listing not found for update!");
    }
    req.flash("success", "Listing Updated !");
    res.redirect(`/listings/${id}`);
}));

// Delete Route
router.delete('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) {
        throw new expressErrors(404, "Listing not found for deletion!");
    }
    req.flash("success", "Listing Deleted !");
    res.redirect("/listings");
}));


module.exports = router;