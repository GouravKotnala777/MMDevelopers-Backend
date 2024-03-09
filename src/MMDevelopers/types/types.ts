import { ObjectId, Schema, Types } from "mongoose";

export interface NewUserRequestBody {
    _id:string;
    name:string;
    email:string;
    pic:string;
    gender:string;
    role:string;
    dob:Date
};

export interface NewPaymentRequestBody {
    amount:number;
    modeOfPayment:"cash" | "cheque" | "transfer";
    transactionID?:number;
    chequeNumber?:number;
    receiverAccount?:number;
    client:ObjectId;
    date:Date;
};

export interface NewClientRequestBody {
    _id?:number;
    code?:number;
    name?:string;
    careTaker?:string;
    role?:"agent"|"client";
    address?:string;
    mobile?:number;
}

export interface NewPlotBody {
    site_name:"Jajru(Ist)" | "Jajru(IInd)" | "Jajru(IVth)" | "Jajru(Vth)" | "Jajru(VIth)" | "Sec-58";
    plot_no:number;
    size:number;
    rate:number;
    client?:string;
    payment?:Types.ObjectId;
    hasSold:boolean;
}

export interface SearchRequestQuery {
    search?:string;
    rate?:string;
    hasSold?:boolean;
    sort?:string;
    page?:string
}

export interface BaseQuery {
    site_name?:{
        $regex:string;
        $options:string;
    };
    rate?:{$lte:number;};
    hasSold?:boolean;
}

export type InvalidateCacheProps = {
    product?:boolean;
    order?:boolean;
    admin?:boolean;
    userId?:string;
    productId?:string|string[];
    orderId?:string;
};

export type OrderItemsType = {
    name:string;
    photo:string;
    price:number;
    quantity:number;
    productId:string;
}
export type ShippingInfoType = {
    address:string;
    city:string;
    state:string;
    country:string;
    pin:number;
}

export interface NewOrderRequestBody {
    shippingInfo:ShippingInfoType;
    user:string;
    subtotal:number;
    tax:number;
    shippingCharges:number;
    discount:number;
    total:number;
    orderItems:OrderItemsType[];
}