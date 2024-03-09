import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/utility-class";

export const errorMiddleware = (err:ErrorHandler, req:Request, res:Response, next:NextFunction) => {
    err.message ||= "Internal Server Error....";
    err.statusCode ||= 500;

    if (err.name === "CastError") err.message = "Invalid ID";

    console.log("===============");
    console.log(err.message);
    console.log(err.statusCode);
    console.log("===============");
    
    return res.status(err.statusCode).json({success:false, message:err.message});
}




// export const errorMiddleware = (error:ErrorHandler, req:Request, res:Response, next:NextFunction) => {
//     error.message ||= "Internal Server Error....";
//     error.statusCode ||= 500;
    
//     return res.status(error.statusCode).json({success:false, error:error.message})
// };