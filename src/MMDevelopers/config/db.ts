import mongoose from "mongoose";

const connectDatabase = (uri:string) => {
    mongoose.connect(uri, {
        dbName:"MMDevelopers"
    })
    .then(() => {return mongoose.connection.db.collection("payments").createIndex({transactionID:1}, {unique:true, sparse:true})})
    .then(() => console.log("database...."))
    .catch((error) => console.log(error));
}

export default connectDatabase;