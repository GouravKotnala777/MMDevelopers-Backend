import express from "express";
import { isUserAuthenticated } from "../middleware/auth";
import { createClient, deleteClientBYBody, updateClientByBody } from "../controllers/clientController";


const app = express.Router();

// app.route("/all").get(allClients)
app.route("/new").post(createClient);
// app.route("/remove").delete(deleteClientByIdByBody);
app.route("/client/update").put(updateClientByBody)
                        .delete(deleteClientBYBody);
// app.route("/:id")
//                 .post();

export default app;