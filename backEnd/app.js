const express = require('express')
const connectToDb = require('./config/connectToDb');
const {errorHandler,notFound }= require('./middlewares/error');
require("dotenv").config();

//connect to DB
connectToDb();

// init app 
const app = express()

//Middlewares

app.use(express.json());

//routes

app.use("/api/auth",require("./routes/authRoute"))
app.use("/api/users",require("./routes/usersRoute"));
app.use("/api/posts",require("./routes/postsRoute"));
app.use("/api/comments",require( "./routes/commentsRoute"));
app.use("/api/categories",require( './routes/categoriesRoute'));


//error Handler Middleware
app.use(notFound)
app.use(errorHandler)


//runing the app 

const Port = process.env.PORT || 8000

app.listen(Port, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} on port ${Port}`)
})