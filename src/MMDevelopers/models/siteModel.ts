import mongoose, { Schema, Document, ObjectId } from "mongoose";

interface PlotForSiteModel extends Document {
    _id:string;
    site_name:string;
    plot_no:number;
    size:number;
    rate:number;
    client:string;
    payments:string;
    duration:number;
    downPayment:number;
    hasSold:boolean;
    totalShouldPay:number;
    totalPaid:number;
    timeCovered:number;
    agent:string;
}
interface ISite extends Document {
    site_name:string;
    total_size:number;
    plots?:PlotForSiteModel[];
    totalPrice:number;
    totalShouldPay:number;
    totalPaid:number;
    totalBalance:number;
    timeCovered:number;
    agent:string;
}

const siteSchema = new mongoose.Schema(
    {
        site_name:{
            type:String,
            unique:[true],
            required:[true, "Please enter Site Name"],
        },
        total_size:{
            type:Number,
            required:[true, "Please enter Site Size"]
        },
        plots:[{
            type:Schema.Types.ObjectId,
            ref:"Plot"
        }]
    },
    {
        timestamps:true
    }
);

const siteModel = mongoose.model("Site", siteSchema);

export default siteModel;