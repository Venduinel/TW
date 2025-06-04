import Controller from '../interfaces/controller.interface';
import { Request, Response, NextFunction, Router } from 'express';

import mongoose from 'mongoose';

import { checkIdParam } from '../middlewares/deviceIdParam.middleware';

import DataService from '../modules/services/data.service';

import { config } from '../config';

import Joi = require('joi');
import { read } from 'fs';

let testArr = [4, 5, 6, 3, 5, 3, 7, 5, 13, 5, 6, 4, 3, 6, 3, 6];

class DataController implements Controller {
    public path = '/api/data';
    public router = Router();
    // private dataService: DataService;

    constructor(private dataService: DataService) {
        // this.dataService = new DataService();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/latest`, this.getLatestReadingsFromAllDevices);

        this.router.post(`${this.path}/:id`, checkIdParam, this.addData);

        this.router.get(`${this.path}/:id`, checkIdParam, this.getAllDeviceData);

        this.router.get(`${this.path}/:id/latest`, checkIdParam, this.getLatestDataFromId);

        this.router.get(`${this.path}/:id/:num`, checkIdParam, this.getSomeDataFromId);

        this.router.delete(`${this.path}/all`, this.deleteAllElements);

        this.router.delete(`${this.path}/:id`, checkIdParam, this.deleteElementFromId);
    }

    private getAllDeviceData = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const { id } = request.params;
            const allData = await this.dataService.query(id);
            response.status(200).json(allData);
        } catch (error) {
            next(error);
        }
    };

    private addData = async (request: Request, response: Response, next: NextFunction) => {
        const { air } = request.body;
        const { id } = request.params;

        const deviceId = parseInt(id, 10);
        if (isNaN(deviceId)) {
            return response.status(400).json({ error: 'Invalid device ID' });
        }

        const schema = Joi.object({
            air: Joi.array()
                .items(
                    Joi.object({
                        id: Joi.number().integer().positive().required(),
                        value: Joi.number().positive().required()
                    })
                )
                .unique((a, b) => a.id === b.id),
            deviceId: Joi.number().integer().positive().valid(parseInt(id,10)).required()
        });

        try {
            const validatedData = await schema.validateAsync({ air, deviceId });

            const data = {
                temperature: validatedData.air[0].value,
                pressure: validatedData.air[1].value,
                humidity: validatedData.air[2].value,
                deviceId: validatedData.deviceId,
                readingDate: new Date()
            };

            await this.dataService.createData(data);
            response.status(201).json(data);
        } catch (error: any) {
            console.error(`Validation Error: ${error.message}`);
            response.status(400).json({ error: 'Invalid input data.', details: error.message });
        }
    };


    private addData1 = async (request: Request, response: Response, next: NextFunction) => {
        const { air } = request.body;
        const { id } = request.params;

        const deviceIdNum = Number(id);
        if (isNaN(deviceIdNum)) {
            return response.status(400).json({ error: 'Invalid device ID' });
        }

        const data = {
            temperature: air[0].value,
            pressure: air[1].value,
            humidity: air[2].value,
            deviceId: deviceIdNum,
            readingDate: new Date()
        };

        try {
            await this.dataService.createData(data);
            response.status(200).json(data);
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response.status(400).json({ error: 'Invalid input data.' });
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

    private getLatestDataFromId = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const { id } = request.params;
            const deviceIdNum = Number(id);
            if (isNaN(deviceIdNum)) {
                return response.status(400).json({ message: "Invalid device ID" });
            }
            const latestData = await this.dataService.get(deviceIdNum);
            if (!latestData) {
                return response.status(404).json({ message: "Data not found" });
            }
            response.status(200).json(latestData);
        } catch (error) {
            next(error);
        }
    };

    private getLatestReadingsFromAllDevices = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const latestData = await this.dataService.getAllNewest(config.supportedDevicesNum);
            response.status(200).json(latestData);
        } catch (error) {
            next(error);
        }
    };

    private deleteElementFromId = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const { id } = request.params;
            const deviceIdNum = Number(id);
            if (isNaN(deviceIdNum)) {
                return response.status(400).json({ message: "Invalid device ID" });
            }
            await this.dataService.deleteData(deviceIdNum);
            response.status(200).json({ message: `Data for device ${deviceIdNum} deleted.` });
        } catch (error) {
            next(error);
        }
    };
}

export default DataController;