import Controller from '../interfaces/controller.interface';
import { Request, Response, NextFunction, Router } from 'express';
import DataService from '../modules/services/data.service';
import { IData } from '../modules/models/data.model';

interface Item {
    id: number;
    name: string;
    description: string;
}

class DataController implements Controller {
   public path = '/api/data';
   public router = Router();
   private dataService = new DataService();
   private items: Item[] = [];


   constructor() {
       this.initializeRoutes();
   }


   private initializeRoutes() {
        this.router.get(`${this.path}/get`, this.getAll);
        this.router.post(`${this.path}/post`, this.addItem);
        this.router.delete(`${this.path}/delete/:id`, this.deleteItem);
   }

   private getAll = async (req: Request, res: Response) => {
        const data = await this.dataService.getAll();
        //console.log(data);
        res.json(data);
        
    };

    private addItem = async (req: Request, res: Response) => {
        try {
            await this.dataService.addItem(req.body);
        } catch(e) {
            res.sendStatus(400);
        } 
        res.sendStatus(200);
    }
    
    private deleteItem = async (req: Request, res: Response) => {
        const itemId = req.params.id;
        await this.dataService.deleteItem(itemId);
        res.sendStatus(200);
    }
}


export default DataController;