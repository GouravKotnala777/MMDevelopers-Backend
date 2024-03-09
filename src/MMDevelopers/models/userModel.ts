import mongoose from "mongoose";

interface IUser extends Document{
    _id:string;
    name:string;
    email:string;
    pic:string;
    role:"manager"|"admin"|"client"|"user";
    gender:"male"|"female";
    dob:Date;
    createdAt:Date;
    updatedAt:Date;
    //  virtual attribute
    age:number;
};

const userSchema = new mongoose.Schema(
    {
        _id:{
            type:String,
            required:[true, "Please enter ID"]
        },
        name:{
            type:String,
            required:[true, "Please add Name"]
        },
        email:{
            type:String,
            unique:[true, "Email already Exists"],
            required:[true, "Please add Email"]
        },
        pic:{
            type:String,
            required:[true, "Please add Photo"]
        },
        role:{
            type:String,
            enum:["manager", "admin", "client", "user"],
            default:"user"
        },
        gender:{
            type:String,
            enum:["male", "female"],
            required:[true, "Please enter Gender"]
        },
        dob:{
            type:Date,
            required:[true, "Please enter Date-Of-Birth"]
        }

    },
    {
        timestamps:true
    }
);

userSchema.virtual("age").get(function(){
    const today = new Date();
    const dob = this.dob;
    let age = today.getFullYear() - dob.getFullYear();

    if (today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() &&
    today.getDate() < dob.getDate())
    ){
        age--;
    }

    return age;
});

const userModel = mongoose.model<IUser>("User", userSchema);

export default userModel;