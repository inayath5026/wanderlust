const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Listing = require('./models/listings.js');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const expressErrors = require('./utils/expressErrors.js');
const { listingSchema } = require('./schema.js');

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
        console.log("Conneted to DB.");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

// Listings Route
app.get('/listings', wrapAsync( async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// New Route
app.get('/listings/new', (req, res) => {
    res.render("listings/new.ejs");
});

// Show Route
app.get('/listings/:id', wrapAsync( async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
}));

// Create Route
app.post('/listings',wrapAsync( async (req, res, next) => {
        const result = listingSchema.validate(req.body);

        if(result.error){
            throw new expressErrors(400, result.error);
        }

        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
    }
));

// Edit Route
app.get('/listings/:id/edit', wrapAsync( async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

// Update Route
app.put('/listings/:id', wrapAsync( async (req, res) => {

    if(!req.body.listing){
        throw new expressErrors(400, "Send Valid Data For Listing !");
    }

    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

// Delete Route
app.delete('/listings/:id', wrapAsync( async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

app.get('/', (req, res) => {
    res.send("Root Route.");
});

app.all('*', (req, res, next)=>{
    next(new expressErrors(404,"Page Not Found !"));
})

app.use((err,req,res,next)=>{
    const {statusCode=500, message="Something Went Wrong !"} = err;
    res.render("listings/error.ejs",{statusCode,message});
});

app.listen(PORT, () => {
    console.log(`App is Listening to PORT : ${PORT}`);
});