import { NextFunction, Request, Response } from "express";
import Site from "../models/siteModel";
import ErrorHandler from "../utils/utility-class";
import Plot from "../models/plotModel";


interface Client {
    name:string,
    price:number;
    stock:number;
    category:string;
    photo:string;
    _id:string;
};
interface Payment {
    _id:string;
    slipNo:string;
    amount:number;
    modeOfPayment:string;
    transactionID:number;
    chequeNumber:number;
    receiverAccount:number;
    date:string;
};
interface PlotForSiteModel {
    _id:string;
    site_name:string;
    plot_no:number;
    size:number;
    rate:number;
    client:Client;
    payments:Payment[];
    duration:number;
    downPayment:number;
    hasSold:boolean;
    totalShouldPay:number;
    totalPaid:number;
    timeCovered:number;
    agent:string;
}
interface ISite {
    site_name:string;
    total_size:number;
    plots?:PlotForSiteModel[];
    // totalPrice:number;
    // totalShouldPay:number;
    // totalPaid:number;
    // totalBalance:number;
}



export const allSites = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const sites:ISite[] = await Site.find()
                    .populate({path:"plots", model:"Plot", select:"_id plot_no size rate client payments duration downPayment hasSold totalShouldPay timeCovered totalPaid createdAt updatedAt agent",
                    populate:{path:"payments", model:"Payment", select:"_id amount modeOfPayment transactionID chequeNumber receiverAccount paymentStatus client"}
                });
                
        if (!sites) return next(new ErrorHandler("No sites found", 404));
    
        res.status(200).json({success:true, message:sites})    
    } catch (error) {
        console.log(error);
        next(error);
    }
    
};
export const createSite = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {site_name, total_size} = req.body;
        
        if (!site_name || !total_size) return next(new ErrorHandler("All fields are required", 404));
        
        const isSiteExist = await Site.findOne({site_name});
        
        if (isSiteExist) return next(new ErrorHandler(`Site with name ${site_name} already exists`, 404));

        const site = await Site.create({site_name, total_size});
        
        if (!site) return next(new ErrorHandler("No sites found", 404));
        
        res.status(200).json({success:true, message:"Site created successfully"});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const updateSite = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {siteID} = req.params;
        const {site_name, total_size} = req.body;

        if (!siteID) return next(new ErrorHandler("Wrong SiteID", 404));
        if (!site_name && !total_size) return next(new ErrorHandler("You have not fill any input field", 404));

        const isSiteExist = await Site.findOne({site_name});        
        if (isSiteExist) return next(new ErrorHandler(`Site with name ${site_name} already exists, Type another Site Name to Update`, 404));

        const site = await Site.findByIdAndUpdate(siteID, {
            ...(site_name && {site_name}),
            ...(total_size && {total_size})
        });
        if (!site) return next(new ErrorHandler("No sites found", 404));
        

        let plotsWithOldSiteName = await Plot.find({site_name:site.site_name});

        if (plotsWithOldSiteName.length === 0) return next(new ErrorHandler("No plots with this Site Name found", 404));

        plotsWithOldSiteName.forEach(async(plot) => {
            plot.site_name = site_name;

            await plot.save();

            // await Plot.findByIdAndUpdate(plot.id, {site_name});
        })
        


        res.status(200).json({success:true, message:"Site updated successfully"});
    } catch (error) {
        console.log(error);
        next(error);        
    }
};
export const deleteSite = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {siteID} = req.params;
    
        if (!siteID) return next(new ErrorHandler("Wrong SiteID", 404));
    
        const site = await Site.findByIdAndDelete(siteID);
        
        if (!site) return next(new ErrorHandler("No sites found", 404));

        site.plots.forEach(async (plotID) => {
            await Plot.findByIdAndDelete(plotID);
        });
    
        res.status(200).json({success:true, message:"Site deleted successfully"});
    } catch (error) {
        console.log(error);
        next(error);        
    }
};









// export const singleSite = async(req:Request, res:Response, next:NextFunction) => {
//     try {
//         const {siteID} = req.params;
    
//         if (!siteID) return next(new ErrorHandler("Wrong SiteID", 404));
    
//         const site = await Site.findById(siteID);
        
//         if (!site) return next(new ErrorHandler("No sites found", 404));
    
//         res.status(200).json({success:true, message:site});
//     } catch (error) {
//         console.log(error);
//         next(error);
//     }
// };
// export const calculations = async(req:Request, res:Response, next:NextFunction) => {
//     try {
//         const allSites = await Site.find()
//                             .populate({path:"plots", model:"Plot", select:"_id plot_no size rate client payments duration downPayment hasSold",
//                                 populate:{path:"payments", model:"Payment", select:"_id amount modeOfPayment transactionID chequeNumber receiverAccount paymentStatus client date"}
//                             });
     
//         res.status(200).json({success:true, message:"This is Data"});
//     } catch (error) {
//         console.log(error);
//         next(error);        
//     }
// };