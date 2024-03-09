// const express = require("express");
import express from "express";
import { deleteUser, getAllUsers, getUser, register } from "../controllers/userController";
import { isUserAuthenticated } from "../middleware/auth";
const app = express.Router();

// userRoute /api/v1/user/

app.route("/new").post(register);
app.route("/all").post(isUserAuthenticated, getAllUsers);
app.route("/:id").get(getUser)
                .delete(deleteUser);


// module.exports = app;
export default app;