import App from './app';
import DataController from './controllers/data.controller';
import IndexController from "./controllers/index.controller";

const app: App = new App([
    new DataController(),
    new IndexController()
]);

app.listen();