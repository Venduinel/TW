import App from './app';
import DataController from "./controllers/DataController";
import ItemController from "./controllers/item.controller";
import IndexController from "./controllers/index.controller";

const app: App = new App([
   new DataController(),
   new ItemController(),
   new IndexController(),
]);

app.listen();