import { NextFunction, Request, Response } from "express";
import Client from "../models/clientModel";
import { BaseQuery, NewClientRequestBody, NewPlotBody, SearchRequestQuery } from "../types/types";
import ErrorHandler from "../utils/utility-class";
import Plot from "../models/plotModel";
import Site from "../models/siteModel";

export const createClient = async(req:Request<{}, {}, NewClientRequestBody>, res:Response, next:NextFunction) => {
    try {
        const {code, name, careTaker, role, address, mobile} = req.body;
    
        if (!code || !name || !careTaker || !address || !mobile) {
            return next(new ErrorHandler("All fields are required", 400));
        }
    
        await Client.create({code,name,careTaker,role,address,mobile});
    
        return res.status(201).json({
            success:true,
            message:"Client created successfully"
        });
    } catch (error) {
        console.log(error);
        next(error);        
    }
};
export const updateClientByBody = async(req:Request<{}, {}, NewClientRequestBody>, res:Response, next:NextFunction) => {
    try {
        const {_id, code, name, careTaker, role} = req.body;
        
        console.log(_id);
        
        const client = await Client.findById(_id);    
    
        if (!client) return next(new ErrorHandler("Client not found", 404));
    
        if (!code && !name && !careTaker) return next(new ErrorHandler("You have not updated anything", 404));

        if (code) client.code = code;
        if (name) client.name = name;
        if (careTaker) client.careTaker = careTaker;
        if (role) client.role = role;
    
        const updatedClient = await client.save({validateBeforeSave:false});
        
        return res.status(201).json({
            success:true,
            message:"Client Updated Successfully"
        });
    } catch (error) {
        console.log(error);
        next(error);        
    }
};
export const deleteClientBYBody = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {clientID, plotID} = req.body
        if (!clientID || !plotID) return next(new ErrorHandler(`invalid ClientID : ${clientID} or PlotID : ${plotID}`, 404));
        const client = await Client.findByIdAndDelete(clientID);
        const plot = await Plot.findByIdAndUpdate(plotID, {client:null, payments:[], hasSold:false, totalPaid:0, totalShouldPay:0, timeCovered:0, agent:null});
    
        
        if (!client) return next(new ErrorHandler("Client not found", 404));
        if (!plot) return next(new ErrorHandler("Plot not found", 404));
        
        return res.status(200).json({success:true, message:"Client deleted successfully"});
    } catch (error) {
        console.log(error);
        next(error);        
    }
};



//          These controllers are needed to be delete




// export const allClients = async(req:Request, res:Response, next:NextFunction) => {
//     try {
//         const clients = await Client.find();
        
//         if (!clients) return next(new ErrorHandler("No Clinets", 404));
        
//         return res.status(200).json({success:true, message:clients});
//     } catch (error) {
//         console.log(error);
//         next(error);        
//     }
// };
// export const singleClient = async(req:Request, res:Response, next:NextFunction) => {
//     try {
//         const {id} = req.params;
    
//         const client = await Client.findById(id);
        
//         if (!client) return next(new ErrorHandler("Client not found", 404));
    
//         return res.status(200).json({success:true, message:client});
//     } catch (error) {
//         console.log(error);
//         next(error);        
//     }
// };
// export const updateClient = async(req:Request<{id:string}, {}, NewClientRequestBody>, res:Response, next:NextFunction) => {
//     try {
//         const {id} = req.params;
//         const {code, name, careTaker, role} = req.body;
//         const client = await Client.findById(id);
    
//         if (!client) return next(new ErrorHandler("plot not found", 404));
    
//         if (code) client.code = code;
//         if (name) client.name = name;
//         if (careTaker) client.careTaker = careTaker;
//         if (role) client.role = role;
    
//         await client.save();
    
//         return res.status(201).json({
//             success:true,
//             message:"UUUUUUUUUUUUUUU"
//         });
        
//     } catch (error) {
//         console.log(error);
//         next(error);        
//     }
// };
// export const deleteClient = async(req:Request, res:Response, next:NextFunction) => {
//     try {
//         if (!req.params.id) return next(new ErrorHandler("Wrong Client Id", 404));
//         const client = await Client.findByIdAndDelete(req.params.id);
        
//         if (!client) return next(new ErrorHandler("Client not found", 404));
    
//         return res.status(200).json({success:true, message:"Client deleted successfully"});
//     } catch (error) {
//         console.log(error);
//         next(error);        
//     }
// };