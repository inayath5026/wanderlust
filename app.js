const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Listing = require('./models/listings.js');

const app = express();
const PORT = 8080;
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));

main()
.then(()=>{
    console.log("Conneted to DB.");
})
.catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

// Listings Route
app.get('/listings', async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
});

// New Route
app.get('/listings/new', (req,res)=>{
    res.render("listings/new.ejs");
});

// Show Route
app.get('/listings/:id', async(req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
});

// Create Route
app.post('/listings', async (req,res)=>{
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});

app.get('/', (req,res)=>{
    res.send("Root Route.");
});

app.listen(PORT , ()=>{
    console.log(`App is Listening to PORT : ${PORT}`);
});