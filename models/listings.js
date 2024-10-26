const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title : {
        type : String,
        required : true
    },
    description : String,
    image : {
        type : String,
        default : "Default Link" ,
        set : (v) => v === "" ? "Default Link" : v 
    },
    price : Number,
    location : String,
    country : String

});

const Listing = new mongoose.model("Listing", listingSchema);

module.exports = Listing;