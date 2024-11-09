const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Listing = require('./models/listings.js');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const expressErrors = require('./utils/expressErrors.js');
const { listingSchema, reviewSchema } = require('./schema.js');
const Review = require('./models/review.js');

const app = express();
const PORT = 8080;
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

main()
    .then(() => {
        console.log("Connected to DB.");
    })
    .catch((err) => {
        console.error("Database connection error:", err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

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

// Listings Route
app.get('/listings', wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// New Route
app.get('/listings/new', (req, res) => {
    res.render("listings/new.ejs");
});

// Show Route
app.get('/listings/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
        throw new expressErrors(404, "Listing not found!");
    }
    res.render("listings/show.ejs", { listing });
}));

// Create Route
app.post('/listings', validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

// Edit Route
app.get('/listings/:id/edit', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new expressErrors(404, "Listing not found!");
    }
    res.render("listings/edit.ejs", { listing });
}));

// Update Route
app.put('/listings/:id', validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const updatedListing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });
    if (!updatedListing) {
        throw new expressErrors(404, "Listing not found for update!");
    }
    res.redirect(`/listings/${id}`);
}));

// Delete Route
app.delete('/listings/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) {
        throw new expressErrors(404, "Listing not found for deletion!");
    }
    res.redirect("/listings");
}));

/* REVIEW MODEL */

// Post review
app.post('/listings/:id/reviews', validateReview, wrapAsync( async(req,res)=>{
    const listing = await Listing.findById(req.params.id);
    const newReview = await new Review(req.body.review);
    
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}));

app.get('/', (req, res) => {
    res.send("Root Route.");
});

app.all('*', (req, res, next) => {
    next(new expressErrors(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something Went Wrong!" } = err;
    res.status(statusCode).render("listings/error.ejs", { statusCode, message });
});

app.listen(PORT, () => {
    console.log(`App is listening on PORT: ${PORT}`);
});