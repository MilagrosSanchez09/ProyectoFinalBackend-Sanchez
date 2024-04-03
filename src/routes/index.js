import { Router } from "express";
import productRouter from "./products.router.js";
import userRouter from "./users.router.js";
import cartRouter from "./carts.router.js";
import ticketrouter from "./tickets.router.js"
import mockingproducts from "./mockingproducts.router.js";

export default class MainRouter {
    constructor(){
        this.router = Router();
        this.initRoutes();
    };

    initRoutes() {
        this.router.use('/products', productRouter);
        this.router.use('/users', userRouter);
        this.router.use('/carts', cartRouter);
        this.router.use('/tickets', ticketrouter);
        this.router.use('/mockingproducts', mockingproducts);
    };

    getRouter() {
        return this.router;
    };
};