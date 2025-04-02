import { Router, Request, Response } from 'express';
import Controller from '../interfaces/controller.interface';

interface Item {
    id: number;
    name: string;
    description: string;
}

class ItemController implements Controller {
    public router: Router;
    public path = '/items';
    private items: Item[] = [];
    private currentId = 1;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        console.log(`Registering routes for: ${this.path}`);
    
        this.router.get('/api/items', this.getAllItems);
        this.router.post('/api/items', this.createItem);
        this.router.get('/api/items/:id', this.getItemById);
        this.router.put('/api/items/:id', this.updateItem);
        this.router.delete('/api/items/:id', this.deleteItem);
    }

    private getAllItems = (req: Request, res: Response): void => {
        res.status(200).json(this.items);
    };

    private createItem = (req: Request, res: Response): void => {
        const { name, description } = req.body;
        if (!name || !description) {
            res.status(400).json({ message: "Name and description are required" });
            return;
        }
        const newItem: Item = { id: this.currentId++, name, description };
        this.items.push(newItem);
        res.status(201).json(newItem);
    };

    private getItemById = (req: Request, res: Response): void => {
        const id = parseInt(req.params.id, 10);
        const item = this.items.find(i => i.id === id);
        if (!item) {
            res.status(404).json({ message: "Item not found" });
            return;
        }
        res.status(200).json(item);
    };

    private updateItem = (req: Request, res: Response): void => {
        const id = parseInt(req.params.id, 10);
        const { name, description } = req.body;
        const itemIndex = this.items.findIndex(i => i.id === id);
        if (itemIndex === -1) {
            res.status(404).json({ message: "Item not found" });
            return;
        }
        if (!name || !description) {
            res.status(400).json({ message: "Name and description are required" });
            return;
        }
        this.items[itemIndex] = { id, name, description };
        res.status(200).json(this.items[itemIndex]);
    };

    private deleteItem = (req: Request, res: Response): void => {
        const id = parseInt(req.params.id, 10);
        const itemIndex = this.items.findIndex(i => i.id === id);
        if (itemIndex === -1) {
            res.status(404).json({ message: "Item not found" });
            return;
        }
        this.items.splice(itemIndex, 1);
        res.status(204).send();
    };
}

export default ItemController;
