const Listing = require('./models/listings.js');
const expressErrors = require('./utils/expressErrors.js');
const { listingSchema, reviewSchema } = require('./schema.js');

module.exports.isLoggedIn = (req, res, next)=>{

    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create Listing | Review !");
        return res.redirect("/login");
    }
    next();

};


module.exports.saveRedirectUrl = (req, res, next)=>{

    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();

};

module.exports.isOwner = async(req, res, next)=>{

    const {id} = req.params;
    const listing = await Listing.findById(id);

    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "You're not the owner of this listing !!");
        return res.redirect(`/listings/${id}`);
    }
    next();

}


module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new expressErrors(400, msg);
    } else {
        next();
    }
};

module.exports.validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new expressErrors(400, msg);
    } else {
        next();
    }
};