import Controller from '../interfaces/controller.interface';
import { Request, Response, NextFunction, Router } from 'express';
import path from 'path';
import App from '../app';

import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";

interface Item {
    id: number;
    name: string;
    description: string;
}

class Step2Controller implements Controller {
    public path = '/step2';
    public router = Router();
    private items: Item[] = [];
    private currentId = 1;

    public io: Server;

    constructor(test_io: Server) {
        this.initializeRoutes();

        this.io = test_io;
    }

    private initializeRoutes() {
        this.router.post(this.path, this.serveIndex);

        this.router.get(this.path + 'emit', this.emitReading);
    }

    private serveIndex = async (req: Request, res: Response) => {
        this.io.emit("step2", req.body);
        res.status(201).json(req.body);
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

export default Step2Controller;