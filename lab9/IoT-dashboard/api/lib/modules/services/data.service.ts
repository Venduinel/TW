import DataModel from '../schemas/data.schema';
import { IData, Query } from "../models/data.model";

export default class DataService {

    public async createData(dataParams: IData) {
        try {
            const dataModel = new DataModel(dataParams);
            await dataModel.save();
        } catch (error) {
            console.error('Wystąpił błąd podczas tworzenia danych:', error);
            throw new Error('Wystąpił błąd podczas tworzenia danych');
        }
    }

    public async query(deviceID: string) {
        try {
            const data = await DataModel.find({ deviceId: deviceID }, { __v: 0, _id: 0 });
            return data;
        } catch (error) {
            throw new Error(`Query failed: ${error}`);
        }
    }

    public async get(deviceId: number) {
        try {
            const latestEntry = await DataModel.find({ deviceId }, { __v: 0, _id: 0 })
                .limit(1)
                .sort({ $natural: -1 });
            return latestEntry.length ? latestEntry[0] : null;
        } catch (error) {
            throw new Error(`Get failed: ${error}`);
        }
    }

    public async getAllNewest(supportedDevicesNum: number) {
        try {
            const latestData: IData[] = [];
            await Promise.all(
                Array.from({ length: supportedDevicesNum }, async (_, i) => {
                    try {
                        const latestEntry = await DataModel.find({ deviceId: i }, { __v: 0, _id: 0 })
                            .limit(1)
                            .sort({ $natural: -1 });
                        if (latestEntry.length) {
                            latestData.push(latestEntry[0]);
                        } else {
                            latestData.push({ deviceId: i } as IData);
                        }
                    } catch (error) {
                        console.error(`Błąd podczas pobierania danych dla urządzenia ${i}: ${error.message}`);
                        latestData.push({ deviceId: i } as IData);
                    }
                })
            );
            return latestData;
        } catch (error) {
            throw new Error(`getAllNewest failed: ${error}`);
        }
    }

    public async deleteData(deviceId: number) {
        try {
            await DataModel.deleteMany({ deviceId });
        } catch (error) {
            throw new Error(`Delete failed: ${error}`);
        }
    }
}
