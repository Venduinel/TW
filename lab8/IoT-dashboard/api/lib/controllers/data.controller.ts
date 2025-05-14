import Controller from '../interfaces/controller.interface';
import { Request, Response, NextFunction, Router } from 'express';

let testArr = [4, 5, 6, 3, 5, 3, 7, 5, 13, 5, 6, 4, 3, 6, 3, 6];

class DataController implements Controller {
    public path = '/api/data';
    public router = Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/latest`, this.getLatestReadingsFromAllDevices);

        this.router.post(`${this.path}/:id`, this.addData);

        this.router.get(`${this.path}/:id`, this.getDataFromId);

        this.router.get(`${this.path}/:id/latest`, this.getLatestDataFromId);

        this.router.get(`${this.path}/:id/:num`, this.getSomeDataFromId);

        this.router.delete(`${this.path}/all`, this.deleteAllElements);

        this.router.delete(`${this.path}/:id`, this.deleteElementFromId);
    }

    private getLatestReadingsFromAllDevices = (request: Request, response: Response, next: NextFunction) => {
        try {
            response.status(200).json(testArr);
        } catch (error) {
            next(error);
        }
    };

    private addData = (request: Request, response: Response, next: NextFunction) => {
        try {
            const { elem } = request.body;
            if (elem === undefined) {
                return response.status(400).json({ message: "Element is required" });
            }

            testArr.push(elem);

            response.status(201).json(testArr);
        } catch (error) {
            next(error);
        }
    };

    private getDataFromId = (request: Request, response: Response, next: NextFunction) => {
        try {
            const { id } = request.params;
            const data = testArr[Number.parseInt(id)];

            if (data === undefined) {
                return response.status(404).json({ message: "Data not found" });
            }

            response.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    private getLatestDataFromId = (request: Request, response: Response, next: NextFunction) => {
        try {
            const { id } = request.params;
            const data = testArr.filter((_, index) => index === Number.parseInt(id));
            const latestData = Math.max(...data);

            if (isNaN(latestData)) {
                return response.status(404).json({ message: "Data not found" });
            }

            response.status(200).json(latestData);
        } catch (error) {
            next(error);
        }
    };

    private getSomeDataFromId = (request: Request, response: Response, next: NextFunction) => {
        try {
            const { id, num } = request.params;
            const start = Number.parseInt(id);
            const length = Number.parseInt(num);

            const data = testArr.slice(start, start + length);

            if (data.length === 0) {
                return response.status(404).json({ message: "Data not found" });
            }

            response.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    private deleteAllElements = (request: Request, response: Response, next: NextFunction) => {
        try {
            testArr = [];
            response.status(200).json({ message: "All elements deleted" });
        } catch (error) {
            next(error);
        }
    };

    private deleteElementFromId = (request: Request, response: Response, next: NextFunction) => {
        try {
            const { id } = request.params;
            const index = Number.parseInt(id);

            if (testArr[index] === undefined) {
                return response.status(404).json({ message: "Data not found" });
            }

            testArr.splice(index, 1);

            response.status(200).json({ message: "Element deleted" });
        } catch (error) {
            next(error);
        }
    };
}

export default DataController;