// import { NewPaymentRequestBody } from "../types/types";
import mongoose, {Schema, Document, Types} from "mongoose";
import { ObjectId } from "mongoose";
import { ObjectIdSchemaDefinition } from "mongoose";

interface NewPaymentRequestBody extends Document {
    slipNo:number;
    amount:number;
    modeOfPayment:"cash" | "cheque" | "transfer";
    transactionID:number|null;
    chequeNumber:number|null;
    receiverAccount:number|null;
    paymentStatus?:"token"|"emi"|"cancelled"|"bounced"|"wasted";
    client?:string|null;
    createdAt:Date;
};

const paymentSchema = new mongoose.Schema<NewPaymentRequestBody>(
    {
        slipNo:{
            type:Number,
            required:true
        },
        amount:{
            type:Number,
            required:[true, "Please enter Payment Amount"]
        },
        modeOfPayment:{
            type:String,
            enum:["cash", "cheque", "transfer"],
            required:[true, "Please enter correct Mode Of Payment"]
        },
        transactionID:{
            type:Number,
            unique:true,
            sparse:true,
            required:function(){
                return this.modeOfPayment === "transfer";
            }
        },
        chequeNumber:{
            type:Number,
            unique:true,
            sparse:true,
            required:function(){
                return this.modeOfPayment === "cheque";
            }
        },
        receiverAccount:{
            type:Number,
            required:function(){
                return this.modeOfPayment !== "cash";
            }
        },
        paymentStatus:{
            type:String,
            enum:["token", "emi", "cancelled", "bounced", "wasted"],
            required:true,
            default:"emi"
        },
        client:{
            type:Schema.Types.ObjectId,
            ref:"Client",
            required:true
        }
    },
    {
        timestamps:true
    }
);

const paymentModel = mongoose.model<NewPaymentRequestBody>("Payment", paymentSchema);

export default paymentModel;