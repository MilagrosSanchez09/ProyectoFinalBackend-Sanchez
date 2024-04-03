import MongoDao from "../mongo.dao.js";
import { ProductModel } from "./product.model.js";

export default class ProductMongoDao extends MongoDao {
    constructor() {
        super(ProductModel);
    };

    async createProduct(productData, ownerId) {
        try {
            const newProduct = await this.model.create({
                ...productData,
                product_owner: ownerId,
                ownerId,
            });
            return newProduct;
        } catch (error) {
            throw new Error(`Error al crear el producto: ${error.message}`);
        }
    };
    
    async deleteProduct(productId, ownerId, isAdmin) {
        try {
            if (isAdmin || ownerId === productId.product_owner) {
                const deletedProduct = await this.deleteById(productId);
                return deletedProduct;
            } else {
                logger.error(`El usuario no tiene permiso para realizar esta acción: ${ownerId}`);
                throw new Error("El usuario no tiene permiso para eliminar este producto");
            }
        } catch (error) {
            logger.error(`Error al eliminar el producto: ${error.message}`);
            throw new Error(`Error al eliminar el producto: ${error.message}`);
        }
    };

    async delete(id) {
        try {
            const deletedProduct = await this.model.findByIdAndDelete(id);
            return deletedProduct;
        } catch (error) {
            throw new Error(`Error al eliminar el producto: ${error.message}`);
        }
    };

    async update(productId, productData) {
        try {
            const updatedProduct = await this.model.findByIdAndUpdate(productId, productData, { new: true });
            return updatedProduct;
        } catch (error) {
            throw new Error(`Error al actualizar el producto: ${error.message}`);
        }
    };    
};