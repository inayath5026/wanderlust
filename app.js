const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const expressErrors = require('./utils/expressErrors.js');
const listingRouter = require('./routes/listings.js');
const reviewRouter = require('./routes/reviews.js');
const userRouter = require('./routes/user.js');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

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

const sessionOptions = {
    secret : "mySuperSecretCode",
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.get('/demoUser', async(req,res)=>{
    let fakeUser = User({
        email : "abcd@gmail.com",
        username : "ABCD@1234",
    });

    let registeredUser = await User.register(fakeUser, "password");
    res.send(registeredUser);
});

app.use('/listings', listingRouter);
app.use('/listings/:id/reviews', reviewRouter);
app.use('/user', userRouter);

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
