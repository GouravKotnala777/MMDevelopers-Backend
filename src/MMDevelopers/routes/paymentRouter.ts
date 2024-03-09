// import { isUserAuthenticated } from "../middleware/auth";
import express from "express";
import { allPayments, createPayment, deletePayment, removePaymentFromPlot, updatePayment, updatePaymentStatusFromPlot } from "../controllers/paymentController";


const app = express.Router();

app.route("/all").get(allPayments)
app.route("/new/:clientID/:plotID").post(createPayment);
app.route("/plot/:plotID/payment/:paymentID").delete(removePaymentFromPlot)
                                            .put(updatePaymentStatusFromPlot)
app.route("/:id")
// .get(getPaymentByParams)
// app.route("/:id").get(searchSinglePayment)
                .post(updatePayment)
                .delete(deletePayment);

export default app;