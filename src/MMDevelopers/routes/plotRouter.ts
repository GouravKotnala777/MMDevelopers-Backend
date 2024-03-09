import express from "express";
import { isUserAuthenticated } from "../middleware/auth";
import { createPlot, deletePlot, updatePlot, plotsBySite, plotsBySiteAndPlotNo, sellPlot, deletePlotByBody } from "../controllers/plotController";
// import { singleUpload } from "../middleware/multer";
const app = express();


app.route("/new").post(createPlot);
// app.route("/all").get(allPlots);
app.route("/remove").delete(deletePlotByBody);
app.route("/site/:name").get(plotsBySite);
app.route("/site_name/:name/plot/:plot_no").get(plotsBySiteAndPlotNo);
app.route("/sell/plot/:plotID").put(sellPlot);
// app.route("/sold").get();
// app.route("/left").get();
app.route("/:id")
                .put(updatePlot)
                .delete(deletePlot);

export default app;