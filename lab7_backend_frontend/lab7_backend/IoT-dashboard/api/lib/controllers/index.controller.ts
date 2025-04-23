import Controller from '../interfaces/controller.interface';
import {Request, Response, NextFunction, Router} from 'express';
import path from 'path';
import App from '../app';

import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";

class IndexController implements Controller {
    public path = '/*';
    public router = Router();

    public io: Server;

    //app: App = new App([]);
    //io = this.app.getIo();
    

    constructor(test_io: Server) {
        this.initializeRoutes();

        this.io = test_io;
    }

    private initializeRoutes() {
        this.router.get(this.path, this.serveIndex);

        this.router.get(this.path + 'emit', this.emitReading);
    }

    private serveIndex = async (request: Request, response: Response) => {
        response.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    }

    private emitReading = async (request: Request, response: Response, next: NextFunction) => {
        try {
            this.io.emit("message", 'nowy pomiar');
            response.status(200).json({ res: "ok" });
        } catch (error) {
            console.error("Błąd podczas emisji danych:", error);
            response.status(500).json({ error: "Błąd serwera" });
        }
    };
 


}

export default IndexController;