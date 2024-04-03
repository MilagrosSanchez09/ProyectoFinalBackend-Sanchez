import persistence from "../../persistence.js";
const { productDao } = persistence;
import { logger } from "../../../utils/logger.js";
import ProductReqDTO from "../../dto/product/product.req.dto.js";
import ProductResDTO from "../../dto/product/product.res.dto.js";

export default class ProductRepository {
    constructor() {
        this.dao = productDao;
    };

    async createProduct(product, ownerId) {
        try {
            console.log("ownerId en el repositorio:", ownerId);
            if (userRole === 'admin' || userRole === 'premium'){
                const productDTO = new ProductReqDTO(product);
                const createdProduct = await this.dao.createProduct(productDTO, ownerId);
                logger.info(`Producto creado: ${JSON.stringify(createdProduct)}`);
                return createdProduct;
            }else {
                throw new Error('No tiene permiso para crear productos');
            }
        }catch(error) {
            logger.error(`Error al crear el producto: ${error}`);
            throw new Error(error.message);
        };
    };

    async getProductById (id) {
        try {
            const response = await this.dao.getById(id);
            if(!response) {
                logger.warn(`No se encontró ningún producto con el ID: ${id}`);
                return false;
            }else {
                const resDTO = new ProductResDTO(response);
                logger.info(`Producto encontrado: ${JSON.stringify(resDTO)}`);
                return (resDTO);
            };
        }catch(error) {
            logger.error(`Error al obtener el producto por ID: ${id}, error: ${error}`);
            throw new Error(error.message);
        };
    };

    async updateProduct(productId, productData, ownerId, isAdmin) {
        try {
            const product = await this.dao.getById(productId);
            if (!product) {
                throw new Error('Producto no encontrado');
            }
            if (!isAdmin && ownerId !== product.product_owner) {
                throw new Error('No tiene permiso para actualizar este producto');
            }
            const updatedProduct = await this.dao.update(productId, productData);
            logger.info(`Producto actualizado: ${JSON.stringify(updatedProduct)}`);
            return updatedProduct;
        } catch (error) {
            logger.error(`Error al actualizar el producto: ${error.message}`);
            throw new Error(error.message);
        }
    };
    
    async deleteProduct(productId, ownerId, isAdmin) {
        try {
            const product = await this.dao.getById(productId);
            if (!product) {
                throw new Error('Producto no encontrado');
            }
            if (!isAdmin && ownerId !== product.product_owner) {
                throw new Error('No tiene permiso para eliminar este producto');
            }
            const deletedProduct = await this.dao.delete(productId);
            logger.info(`Producto eliminado: ${JSON.stringify(deletedProduct)}`);
            return deletedProduct;
        } catch (error) {
            logger.error(`Error al eliminar el producto: ${error.message}`);
            throw new Error(error.message);
        }
    }    
}