import express from "express";
import { isUserAuthenticated } from "../middleware/auth";
import { allSites, createSite, deleteSite, updateSite } from "../controllers/siteController";


const app = express.Router();

app.route("/all").get(allSites);
app.route("/new").post(createSite);
app.route("/:siteID")
                .put(updateSite)
                .delete(deleteSite);

export default app;