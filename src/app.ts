import express from "express";
import connectDatabase from "./MMDevelopers/config/db";
import { errorMiddleware } from "./MMDevelopers/middleware/error";
import {config} from "dotenv";
import morgan from "morgan";
import bodyParser from "body-parser";
import cors from "cors";


import userRoute from "./MMDevelopers/routes/userRouter";
import plotRoute from "./MMDevelopers/routes/plotRouter";
import paymentRoute from "./MMDevelopers/routes/paymentRouter";
import clientRoute from "./MMDevelopers/routes/clientRouter";
import siteRoute from "./MMDevelopers/routes/siteRouter";

config({
    path:"./.env"
});

const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || "";

connectDatabase(MONGO_URI);

const app = express();

app.use(express.json());
app.use(morgan("dev"));
// app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');    
    res.setHeader('Access-Control-Allow-Credentials', "true");  
    next();  
});




app.use("/api/v1/user", userRoute);
app.use("/api/v1/plot", plotRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/client", clientRoute);
app.use("/api/v1/site", siteRoute);

app.use(errorMiddleware);


app.listen(PORT, () => {    
    console.log("listening....");
});