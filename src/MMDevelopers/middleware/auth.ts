import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/utility-class";
import User from "../models/userModel";

export const isUserAuthenticated = async(req:Request, res:Response, next:NextFunction) => {
    const {id} = req.query;
    if (!id) return next(new ErrorHandler("login first", 401));
    const user = await User.findById(id);
    
    if (!user) return next(new ErrorHandler("Wrong auth Id", 401));
    if (user.role !== "admin") return next(new ErrorHandler("Only admin can access this", 403));
    next();
};