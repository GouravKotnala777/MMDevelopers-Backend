import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
    {
        code:{
            type:Number,
            required:[true, "Please enter Code"]
        },
        name:{
            type:String,
            required:[true, "Please add Name"]
        },
        careTaker:{
            type:String,
            required:[true, "Please add Gardian Name"]
        },
        address:{
            type:String
        },
        mobile:{
            type:Number
        },
        role:{
            type:String,
            enum:["agent", "client"],
            default:"client"
        },
    },
    {
        timestamps:true
    }
);


const clientModel = mongoose.model("Client", clientSchema);

export default clientModel;