import express from "express";
import { engine } from "express-handlebars";
import bodyParser from "body-parser";
import SettingsBill from "./settings-bill.js"
import  moment from "moment";

const app = express();
const settingsBill = SettingsBill();

const PORT = process.env.PORT || 3000;

app.engine("handlebars", engine({
    layoutsDir: "./views/layouts"
}));
app.set("view engine", "handlebars");
app.set("views", "./views");
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get("/", (req, res) => {
    res.render("index", {
        settings: settingsBill.getSettings(),
        totals: settingsBill.totals(),
        levelsCheck: settingsBill.levelsCheck()
    });
});

app.post("/settings", (req, res) => {

    settingsBill.setSettings({
        callCost: req.body.callCost,
        smsCost: req.body.smsCost,
        warningLevel: req.body.warningLevel,
        criticalLevel: req.body.criticalLevel
    })
    res.redirect("/")
});

app.post("/action", (req, res) => {

    settingsBill.recordAction(req.body.actionType)

    res.redirect("/");
});

app.get("/actions", (req, res) => {

    const currentTimestamp = settingsBill.actions().map(item => {
        return {
            type: item.type,
            cost: item.cost,
            timestamp: moment(item.timestamp).fromNow()
        }
    })

    res.render("actions", {
        actions: currentTimestamp
    })
});

app.get("/actions/:actionType", (req, res) => {
    const actionType = req.params.actionType;

    res.render("actions", {
        actions: settingsBill.actionsFor(actionType)
    })
});

app.listen(PORT)