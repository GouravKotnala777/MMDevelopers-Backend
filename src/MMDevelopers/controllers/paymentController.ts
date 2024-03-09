import { NextFunction, Request, Response } from "express";
import mongoose, { Document, Types } from "mongoose";
import Payment from "../models/paymentModel";
import ErrorHandler from "../utils/utility-class";
import Plot from "../models/plotModel";
import Site from "../models/siteModel";
// import { Document, Types, ObjectId } from "mongoose";
// import { NewPaymentRequestBody } from "../types/types";


interface CreatePaymentRequest extends Request {
    params: {
        id?: string;
        plotID?:string;
        clientID?:string;
        paymentID?:string;
    };
    body: {
        _id?:string;
        slipNo:number;
        amount?: number;
        modeOfPayment?: "cash" | "cheque" | "transfer";
        transactionID?: number | null;
        chequeNumber?: number | null;
        receiverAccount?: number | null;
        paymentStatus?:"token"|"emi"|"cancelled"|"bounced"|"wasted";
        client?:string|null; // Assuming "client" is a string, you might need to adjust it based on your model
        // client: Types.ObjectId; // Assuming "client" is a string, you might need to adjust it based on your model
    };
}


export const allPayments = async(req:CreatePaymentRequest, res:Response, next:NextFunction) => {

    const payments = await Payment.find({});

    if (!payments) return(next(new ErrorHandler("No Payments", 402)));

    return res.status(200).json({success:true, message:payments});
};
export const createPayment = async(req:CreatePaymentRequest, res:Response, next:NextFunction) => {
    const plotID = req.params.plotID;
    const clientID = req.params.clientID;
    const {
    slipNo,
    amount,
    modeOfPayment,
    transactionID,
    chequeNumber,
    receiverAccount,
    paymentStatus} = req.body;

    console.log({slipNo,amount,
        modeOfPayment,
        transactionID,
        chequeNumber,
        receiverAccount,
        paymentStatus});
    

    if (!slipNo || !amount ||
        !modeOfPayment ||
        (modeOfPayment === "cheque" && !chequeNumber) ||
        (modeOfPayment === "transfer" && !transactionID) ||
        ((modeOfPayment === "transfer" || modeOfPayment === "cheque")
        && (!receiverAccount))) return next(new ErrorHandler("All fields are required", 400));
    if (!plotID) return next(new ErrorHandler("wrong plot id", 400));
    if (!clientID) return next(new ErrorHandler("wrong client id", 400));

        try {
            let plot = await Plot.findById(plotID);
            const payment = await Payment.create({slipNo, amount, modeOfPayment, transactionID, chequeNumber, receiverAccount, paymentStatus, client:clientID});

            if (!plot) return next(new ErrorHandler("Plot not found", 400));
            
            // const site = await Site.findOne({site_name:plot.site_name});
            // if (!site) return next(new ErrorHandler("Site not found", 400));
            
            let creationDate = await Payment.find({client:clientID});

            plot.totalPaid += Number(amount);
            plot?.payments.push(payment._id);
            plot.timeCovered = (payment.createdAt.getFullYear() - creationDate[0].createdAt.getFullYear()) * 12 + (payment.createdAt.getMonth() - creationDate[0].createdAt.getMonth());

            // site.allPlotsPayments += Number(amount);
            // site.allPlotsBalance -= Number(amount);

            const updatedPlot = await plot.save();

            // await site.save();
        
            return res.status(201).json({success:true, message:"Payment Successfull"});
            
        } catch (error) {
            console.log(error);
            
            // next(error);
        }

};
export const updatePayment = async(req:CreatePaymentRequest, res:Response, next:NextFunction) => {
    const {id} = req.params;
    
    if (!id) return(next(new ErrorHandler("Invalid Transaction Id", 400)));
    
    const payment = await Payment.findById(id);

    if (!payment) return(next(new ErrorHandler("Transaction not found", 400)));

    const {
        slipNo,
        amount,
        modeOfPayment,
        transactionID,
        chequeNumber,
        receiverAccount,
        paymentStatus,
        client} = req.body;

    if (slipNo) payment.slipNo = slipNo;
    if (amount) payment.amount = amount;
    if (modeOfPayment) payment.modeOfPayment = modeOfPayment;
    if (transactionID) payment.transactionID = transactionID;
    if (chequeNumber) payment.chequeNumber = chequeNumber;
    if (receiverAccount) payment.receiverAccount = receiverAccount;
    if (paymentStatus) payment.paymentStatus = paymentStatus;
    if (client) payment.client = client;
    
    await payment.save();
    // if (!discount) return(next(new ErrorHandler("Invalid Coupan Code", 400)));

    return res.status(201).json({success:true, message:payment});
};
export const deletePayment = async(req:Request, res:Response, next:NextFunction) => {
    const {id} = req.params;

    if (!id) return(next(new ErrorHandler("Invalid Transaction Id", 400)));

    const payment = await Payment.findByIdAndDelete(id);

    if (!payment) return next(new ErrorHandler("Invalid Payment Id", 400));
    
    return res.status(200).json({success:true, message:`${payment} : deleted`});
};
export const removePaymentFromPlot = async(req:CreatePaymentRequest, res:Response, next:NextFunction) => {
    try {
        const {paymentID, plotID} = req.params;
    
        if (!paymentID) return(next(new ErrorHandler("Invalid Transaction Id", 400)));
        if (!plotID) return(next(new ErrorHandler("Invalid Plot Id", 400)));
        
        const plot = await Plot.findById(plotID).populate({path:"payments", model:"Payment"});
        if (!plot) return(next(new ErrorHandler("No Plot Found", 400)));

        // const site = await Site.findOne({site_name:plot.site_name});
        // if (!site) return(next(new ErrorHandler("No Site Found", 400)));
        
        
        let plotPaymnetFind = plot.payments.find(item => item._id.toString() === paymentID);
        let plotPaymnetsFilter = plot.payments.filter(item => item._id.toString() !== paymentID);

        if (plotPaymnetsFilter.length === 0) {
            plot.client = null;
            plot.hasSold = false;
        }
        if (plotPaymnetFind) {
            plot.totalPaid -= Number(plotPaymnetFind?.amount);
            // site.allPlotsPayments -= Number(plotPaymnetFind);
            // site.allPlotsBalance += Number(plotPaymnetFind);
        }
        
        plot.payments = plotPaymnetsFilter;

        
        await plot.save();
        // await site.save();
        
        return res.status(200).json({success:true, message:`Payment Removed`});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const updatePaymentStatusFromPlot = async(req:CreatePaymentRequest, res:Response, next:NextFunction) => {
    try {
        const {paymentID, plotID} = req.params;
        const {paymentStatus} = req.body;
        
        if (!paymentID) return(next(new ErrorHandler("Invalid Transaction Id", 400)));
        if (!plotID) return(next(new ErrorHandler("Invalid Plot Id", 400)));
        if (!paymentStatus) return(next(new ErrorHandler("Invalid paymentStatus", 400)));
        
        let payment = await Payment.findById(paymentID);
        let plot = await Plot.findById(plotID);
        
        if (!payment) return(next(new ErrorHandler("No Payment Found", 400)));
        if (!plot) return(next(new ErrorHandler("No Plot Found", 400)));
        
        // let site = await Site.findOne({site_name:plot.site_name});
        // if (!site) return(next(new ErrorHandler("No Site Found", 400)));
        
        if (payment.paymentStatus === "token" || payment.paymentStatus === "emi") {
            if (paymentStatus === "cancelled" || paymentStatus === "bounced" || paymentStatus === "wasted") {
                plot.totalPaid -= Number(payment?.amount);
                // site.allPlotsPayments -= Number(payment.amount);
                // site.allPlotsBalance += Number(payment.amount);
            }
        }
        else{
            if (paymentStatus === "token" || paymentStatus === "emi") {
                plot.totalPaid += Number(payment?.amount);
                // site.allPlotsPayments += Number(payment.amount);
                // site.allPlotsBalance -= Number(payment.amount);
            }
        }

        payment.paymentStatus = paymentStatus;

        await payment.save();
        await plot.save();
        // await site.save();
        return res.status(200).json({success:true, message:`Payment Status Updated`});
    } catch (error) {
        console.log(error);
        next(error);
    }
};







// export const getPaymentByParams = async(req:CreatePaymentRequest, res:Response, next:NextFunction) => {
//     const {id} = req.params;

//     if (!id) return(next(new ErrorHandler("Invalid Transaction Id", 400)));    
    
//     try {
//         const payment = await Payment.findById(id).populate({path:"client", model:"Client", select:"code name cateTaker"});
        
//         if (!payment) return(next(new ErrorHandler("Transaction not found", 400)));
//         return res.status(201).json({success:true, message:payment});
        
//     } catch (error) {
//         console.log("}}}}}}}}}}}}}}");
//         console.log(error);
//         console.log("}}}}}}}}}}}}}}");
//         next(error);
//     }
    
// };
// export const searchSinglePayment = async(req:CreatePaymentRequest, res:Response, next:NextFunction) => {
//     const {transactionID} = req.body;
    
//     if (!transactionID) return(next(new ErrorHandler("Invalid Transaction Id", 400)));

//     const payment = await Payment.findOne({transactionID}).populate("Client code");

//     if (!payment) return(next(new ErrorHandler("Transaction not found", 400)));

//     return res.status(201).json({success:true, message:payment});
// };