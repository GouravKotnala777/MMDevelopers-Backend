import { NextFunction, Request, Response } from "express";
import User from "../models/userModel";
import { NewUserRequestBody } from "../types/types";
import ErrorHandler from "../utils/utility-class";


export const register = async(
    req:Request<{}, {}, NewUserRequestBody>,
    res:Response,
    next:NextFunction
    ) => {
        try {
            const {_id, name, email, dob, gender, role, pic} = req.body;

            let user = await User.findById(_id);

            if (user) {
                return res.status(200).json({success:true, message:`Welcome ${user.name}`});
            }

            console.log({
                _id, name, email, dob:new Date(dob), gender, pic, role
            });
            

            if (!_id || !name || !email || !dob || !gender || !pic) return(next(new ErrorHandler("All fields are required", 400)));

            user = await User.create({
                _id, name, email, dob:new Date(dob), gender, pic, role
            });

            console.log(user);
            
            res.status(201).json({success:true, message:`Welcome ${user.name}`});
            
        } catch (error:any) {
            next(error);
        }
};

export const getAllUsers = async(
    req:Request,
    res:Response,
    next:NextFunction
    ) => {
        try {
            // const {_id} = req.body;
            let allUsers = await User.find();
            if (!allUsers) return (next(new ErrorHandler("users not found", 403)));
            res.status(200).json({success:true, message:allUsers});
        } catch (error:any) {
            next(error);
        }
};

export const getUser = async(
    req:Request,
    res:Response,
    next:NextFunction
    ) => {
        try {
            // const {_id} = req.body;
            const {id} = req.params;
            if (!id) return next(new ErrorHandler("no _id params", 402));
            let user = await User.findById(id);
            if (!user) return next(new ErrorHandler("user not found", 402));
            res.status(200).json({success:true, message:user});
        } catch (error:any) {
            next(error);
        }
};

export const deleteUser = async(
    req:Request,
    res:Response,
    next:NextFunction
    ) => {
        try {
            // const {_id} = req.body;
            const {id} = req.params;
            if (!id) return next(new ErrorHandler("no _id params", 402));
            let user = await User.findByIdAndDelete(id);
            if (!user) return next(new ErrorHandler("user not found", 402));
            res.status(200).json({success:true, message:user});
        } catch (error:any) {
            next(error);
        }
};