import mongoose, { Document, Schema, Types } from "mongoose";

interface PaymentsBody {
    _id:string;
    slipNo:number;
    amount:number;
    modeOfPayment:string;
    client:string;
    date:string;
    createdAt:Date;
    updatedAt:Date;
};

interface PlotDocument extends Document{
    _id:Types.ObjectId;
    site_name:string;
    plot_no:number;
    size:number;
    rate:number;
    client:Types.ObjectId|null;
    payments:PaymentsBody[];
    duration:number;
    downPayment:number;
    hasSold:boolean;
    totalShouldPay:number;
    totalPaid:number;
    timeCovered:number;
    agent:string;
};




const plotSchema = new mongoose.Schema<PlotDocument>(
    {
        site_name:{
            type:String,
            required:[true, "Please enter Site Name"]
        },
        plot_no:{
            type:Number,
            required:[true, "Please enter Plot Number"]
        },
        size:{
            type:Number,
            required:[true, "Please enter Plot Size"]
        },
        rate:{
            type:Number,
            required:[true, "Please enter Plot Rate"]
        },
        client:{
            type:Schema.Types.ObjectId,
            ref:"Client"
        },
        payments:[{
            type:Schema.Types.ObjectId,
            ref:"Payment"
        }],
        duration:{
            type:Number,
            required:true,
            default:36
        },
        downPayment:{
            type:Number,
            required:true,
            default:0
        },
        hasSold:{
            type:Boolean,
            default:false
        },
        totalShouldPay:{
            type:Number,
            default:0
        },
        totalPaid:{
            type:Number,
            default:0
        },
        timeCovered:{
            type:Number,
            default:0
        },
        agent:{
            type:String
        }
    },
    {
        timestamps:true
    }
);


const plotModel = mongoose.model<PlotDocument>("Plot", plotSchema);

export default plotModel;