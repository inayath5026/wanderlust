const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review.js');
const defaultLink = "https://plus.unsplash.com/premium_photo-1687960116228-13d383d20188?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";


const listingSchema = new Schema({

    title : {
        type : String,
        required : true
    },
    description : String,
    image : {
        type : String,
        default : defaultLink ,
        set : (v) => v === "" ? defaultLink : v 
    },
    price : Number,
    location : String,
    country : String,
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : "Review",
        },
    ],
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User",
    }

});


listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await Review.deleteMany({_id:{$in:listing.reviews}});
    }
});

const Listing = new mongoose.model("Listing", listingSchema);

module.exports = Listing;