import { NextFunction, Request, Response } from "express";
import Plot from "../models/plotModel";
// import { BaseQuery, NewPlotBody, SearchRequestQuery } from "../types/types";
import ErrorHandler from "../utils/utility-class";
import { Schema, Types } from "mongoose";
import Client from "../models/clientModel";
import Payment from "../models/paymentModel";
import Site from "../models/siteModel";

export interface NewPlotBody {
    site_name:string;
    plot_no:number;
    size:number;
    rate:number;
    client?:Types.ObjectId;
    payment?:Types.ObjectId;
    duration?:number;
    downPayment?:number;
    hasSold?:boolean;
    timeCovered?:number;
    createdAt?:Date;
    updatedAt?:Date;
    agent?:string;
};

interface RegexType {
    $regex:string;
    $options:string;
};

export const createPlot = async(req:Request<{}, {}, NewPlotBody>, res:Response, next:NextFunction) => {
    try {
        const {site_name, plot_no, size, rate, duration, downPayment, hasSold} = req.body;
        console.log({site_name, plot_no, size, rate, duration, downPayment, hasSold});

        if (!site_name ||
            !plot_no ||
            !size ||
            !rate) {
            return next(new ErrorHandler("All fields are required", 400));
        };
        const isPlotExist = await Plot.findOne({site_name, plot_no});
        if (isPlotExist) {
            return next(new ErrorHandler(`Plot No. ${plot_no} is already exist`, 400));
        }
        
        const plot = await Plot.create({site_name, plot_no, size, rate, duration, downPayment});
        
        const site = await Site.findOne({site_name});
        if (!site) return next(new ErrorHandler("Site not found", 400));

        site.plots.push(plot._id);
        // site.allPlotsBalance += Number(size * rate);

        await site.save();
        
        return res.status(201).json({
            success:true,
            message:"Plot created successfully"
        });
    } catch (error) {
        console.log(error);
        next(error);
    }

};
export const plotsBySiteAndPlotNo = async(req:Request, res:Response, next:NextFunction) => {
    try {
        let today = new Date();
        const {name, plot_no} = req.params;
        
        let plot = await Plot.findOne({site_name:name, plot_no})
        .populate({path:"client", model:"Client", select:"code name careTaker mobile address"})
        .populate({path:"payments", model:"Payment", select:"slipNo amount modeOfPayment transactionID chequeNumber receiverAccount paymentStatus createdAt updatedAt"});
        
        // let creationDate = await Payment.find({client:clientID});
        
        
        if (!plot) return next(new ErrorHandler("Plot not found", 404));
        
        console.log("}}}}}}}}}}}}}}");
        console.log((today.getFullYear()));
        console.log(plot);
        console.log("}}}}}}}}}}}}}}");

        if (plot.payments.length > 0) {
            plot.timeCovered = (today.getFullYear() - plot?.payments[0].createdAt.getFullYear()) * 12 + (today.getMonth() - plot?.payments[0].createdAt.getMonth() + 1);
            plot.totalShouldPay = ((plot.size*plot.rate)/plot.duration)*plot.timeCovered;
        }
        
        await plot.save();
    
        return res.status(200).json({success:true, message:plot});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const sellPlot = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const today = new Date();
        const {plotID} = req.params;
        const {code, name, careTaker, slipNo, amount, paymentStatus, agent, mobile, address} = req.body;
        console.log({code, name, careTaker, slipNo, amount, agent, mobile, address});
        
        const isClientExist = await Client.findOne({code});

        if (isClientExist) return next(new ErrorHandler("Client Serial No. already exist", 404));

        const clientNew = await Client.create({code, name, careTaker, mobile, address});
        const paymentNew = await Payment.create({slipNo, amount, modeOfPayment:"cash", paymentStatus, client:clientNew._id});
        
        const plot = await Plot.findOne({_id:plotID});
        if (!plot) return next(new ErrorHandler("Plot not found", 404));
        
        // const site = await Site.findOne({site_name:plot?.site_name});
        // if (!site) return next(new ErrorHandler("Site not found", 404));
        
        plot.client = clientNew._id;
        plot?.payments.push(paymentNew._id);
        plot.hasSold = true;
        plot.totalPaid += Number(amount);  
        plot.agent = agent;

        // site.allPlotsPayments += Number(amount);
        // site.allPlotsBalance -= Number(amount);
        
        if (plot.payments.length > 0) {
            plot.timeCovered = (today.getFullYear() - paymentNew.createdAt.getFullYear()) * 12 + (today.getMonth() - paymentNew.createdAt.getMonth() + 1);
        }
        else{
            plot.timeCovered = 1;
        }
        
        await plot.save();
        // await site.save();
        
        return res.status(200).json({success:true, message:"Payment Successfull"});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const updatePlot = async(req:Request<{id:string}, {}, NewPlotBody>, res:Response, next:NextFunction) => {
    try {
        const {id} = req.params;
        const {site_name, plot_no, size, rate, client, duration, downPayment, hasSold, agent} = req.body;
        const plot = await Plot.findById(id);
    
        if (!plot) return next(new ErrorHandler("plot not found", 404));
    
        if (site_name) plot.site_name = site_name;
        if (plot_no) plot.plot_no = plot_no;
        if (size) plot.size = size;
        if (rate) plot.rate = rate;
        if (hasSold) plot.hasSold = hasSold;
        if (duration) plot.duration = duration;
        if (downPayment) plot.downPayment = downPayment;
        if (client) plot.client = client;
        if (agent) plot.agent = agent;

        await plot.save();

        return res.status(201).json({
            success:true,
            message:"Plot updated successfully"
        });
    } catch (error) {
        console.log(error);
        next(error);
    }

};
export const deletePlotByBody = async(req:Request, res:Response, next:NextFunction) => {
    try {
        if (!req.body._id) return next(new ErrorHandler("req.body.id is undefined", 404));
        const plot = await Plot.findByIdAndDelete(req.body._id);
        if (!plot) return next(new ErrorHandler("Plot not found", 404));

        
        const site = await Site.findOne({site_name:plot?.site_name});
        if (!site) return next(new ErrorHandler("Site not found", 404));


        const filterResult = site?.plots.filter((item) => item._id !== req.body._id);

        if (filterResult?.length > 0) {
            site.plots = filterResult;
        }

        await site.save();
    
        return res.status(200).json({success:true, message:"Plot deleted successfully"});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const deletePlot = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const plot = await Plot.findByIdAndDelete(req.params.id);
    
        if (!plot) return next(new ErrorHandler("Plot not found", 404));
    
        return res.status(200).json({success:true, message:"Plot deleted successfully"});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const plotsBySite = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {name} = req.params;
    
        const plots = await Plot.find({site_name:name});
        
        if (!plots) return next(new ErrorHandler("Plot not found", 404));
    
        return res.status(200).json({success:true, message:plots});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const searchClientByBody = async(req:Request, res:Response, next:NextFunction) => {
    try {
        let Result:any[] = [];
        let clientQuery:{name?:RegexType; mobile?:RegexType; careTaker?:RegexType;} = {};
        let plotQuery:{site_name?:RegexType; plot_no?:RegexType;} = {};
        const {name, careTaker, mobile, plot_no, site_name} = req.body;        

        if (name) {
            clientQuery.name = {$regex:name, $options:"i"};
        }
        if (mobile) {
            clientQuery.mobile = {$regex:mobile, $options:"i"};
        }
        if (careTaker) {
            clientQuery.careTaker = {$regex:careTaker, $options:"i"};
        }
        if (site_name) {
            plotQuery.site_name = {$regex:site_name, $options:"i"};
        }
        if (plot_no) {
            plotQuery.plot_no = plot_no;
        }
        const clients = await Client.find(clientQuery);

        if (clients.length === 0) return next(new ErrorHandler("Client not found", 404));
        
        if (!plotQuery.plot_no && !plotQuery.site_name) {
            await Promise.all(
                clients.map(async (client) => {
                    let plotWithClientId = await Plot.find({client:client._id}).populate({path:"client", model:"Client", select:"code name careTaker mobile"});
                    if (plotWithClientId.length !== 0){
                        Result.push(...plotWithClientId);
                    }
                })
            )
        }
        else{
            const plots = await Plot.find(plotQuery).populate({path:"client", model:"Client", select:"code name careTaker mobile"});
            if (plots.length === 0) return next(new ErrorHandler("Plot not found", 404));
            Result.push(...plots);
        }
        return res.status(200).json({success:true, message:Result});
    } catch (error) {
        next(error);
    }
};