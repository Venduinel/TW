import App from "./app";
import DataController from "./controllers/DataController";
import ItemController from "./controllers/item.controller";
import IndexController from "./controllers/index.controller";
import Step2Controller from "./controllers/step2Controller";


const app: App = new App([]);
const io = app.getIo();


const controllers = [
    new DataController(),
    new ItemController(),
    //new IndexController(),
    new IndexController(io),
    new Step2Controller(io),
];


controllers.forEach((controller) => {
    app.app.use("/", controller.router);
});


app.listen();
