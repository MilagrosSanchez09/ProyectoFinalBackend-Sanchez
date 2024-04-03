import { ProductModel } from "./products/product.model.js";
import { logger } from "../../../utils/logger.js";

export default class MongoDao {
    constructor(model) {
        this.model = model;
    };

    async getAll() {
        try {
            const response = await this.model.find({});
            return response;
        } catch (error) {
            logger.error(`Error al obtener todos los elementos: ${error}`);
        };
    };

    async getById(id) {
        try {
            const response = await this.model.findById(id);
            return response;
        } catch (error) {
            logger.error(`Error al obtener el elemento pod ID: ${id}, error: ${error}`);
        };
    };

    async create(obj, ownerId) {
        try {
            console.log("ownerId:", ownerId)
            const response = await this.model.create({ ...obj, product_owner: ownerId });
            return response;
        } catch (error) {
            logger.error(`Error al crear el elemento: ${error}`);
            throw error;
        };
    };

    async update(id, obj) {
        try {
            const response = await this.model.updateOne({ _id: id }, obj);
            return response;
        } catch (error) {
            logger.error(`Error al actualizar el elementos con ID ${id}: ${error}`);
        };
    };

    async delete(id) {
        try {
            const response = await this.model.findByIdAndDelete(id);
            return response;
        } catch (error) {
            logger.error(`Error al eliminar el elemento con ID ${id}: ${error}`);
        };
    };

    async generateMockedProducts() {
        try {

            const mockedProducts = [];

            for (let i = 1; i <= 100; i++) {
                const newProductData = {
                    product_name: `Mocked Product ${i}`,
                    product_description: `Descripción para el Producto ${i}`,
                    product_price: Math.random() * 100,
                    product_stock: Math.floor(Math.random() * 100),
                };

                mockedProducts.push(newProductData);
            }

            return await ProductModel.insertMany(mockedProducts);
        } catch (error){
            logger.error(`Error al generar productos simulados: ${error}`);
        }
    }

    async getAllByUser(userId) {
        try {
          const response = await this.model.find({ user: userId });
          return response;
        } catch (error) {
          logger.error(`Error al obtener todos los carritos del usuario con ID ${userId}: ${error}`);
          throw new Error("Error al obtener los carritos del usuario");
        }
      }
      
};