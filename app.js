const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = 8080;
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
.then(()=>{
    console.log("Conneted to DB.");
})
.catch((err)=>{
    console.log(err);
})

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.get('/', (req,res)=>{
    res.send("Root Route.");
} );

app.listen(PORT , ()=>{
    console.log(`App is Listening to PORT : ${PORT}`);
});