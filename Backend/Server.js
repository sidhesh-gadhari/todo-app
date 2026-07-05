require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectToDoDB = require('./Db/ToDo.db.js');
const todoRouter = require('./Routes/ToDo.routes.js');
const InitTaskCleanup = require('./Utils/TaskCleanup.js');
const passport = require('passport');
require('./Config/OAuth20.config.js');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());
app.use(passport.initialize());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.use("/api/v1/todo", todoRouter);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const msg = err.message || "Internal Server Error!";

    console.log(`[Error] ${req.method} ${req.url} - ${msg}`);

     return res
            .status(statusCode)   
            .json({
                success: false,
                statusCode,
                message: msg,
                errors: err.errors || []
            })
});

connectToDoDB()
.then(() => {
    InitTaskCleanup();
    app.listen(process.env.PORT, ()=>{console.log(`Server Is Running At Port ${process.env.PORT}`)});
})
.catch((e)=>{
    console.log(e);
})