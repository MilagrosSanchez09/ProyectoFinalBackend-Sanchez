import Services from "./class.services.js";
import persistence from "../persistence/persistence.js";
import { logger } from "../utils/logger.js";
import ProductRepository from "../persistence/repository/product/product.repository.js";

const { productDao } = persistence;
const productRepository = new ProductRepository()

export default class ProductService extends Services {
    constructor() {
        super(productDao);
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
            return await productDao.generateMockedProducts();
        } catch (error) {
            logger.error(`Error al generar productos falsos: ${error.message}`);
            throw new Error(error.message);
        }
    };

    async createProduct(product, userRole, ownerId) {
        try {
            console.log("ownerId en el servicio:", ownerId);
            if (userRole === 'admin' || userRole === 'premium') {
                const newProduct = await productRepository.createProduct(product, ownerId);
                if (!newProduct) {
                    throw new Error("Error al crear producto.");
                } else {
                    logger.info(`Producto creado: ${newProduct}`);
                    return newProduct;
                }
            } else {
                throw new Error("Solo los administradores pueden crear productos.");
            }
        } catch (error) {
            logger.error(`Error al crear el producto: ${error.message}`);
            throw new Error(error.message);
        };
    };

    async getProductById(id) {
        try {
            const product = await productRepository.getProductById(id);
            if (!product) {
                return false;
            } else {
                logger.info(`Producto obtenido por ID: ${product}`);
                return product;
            };
        } catch (error) {
            logger.error(`Error al obtener el producto por ID: ${error.message}`);
            throw new Error(error.message);
        };
    };

    async deleteProduct(productId, ownerId, isAdmin) {
        try {
            const product = await productRepository.getProductById(productId);
            if (!product) {
                throw new Error("Producto no encontrado");
            }
            if (!isAdmin && ownerId !== product.product_owner && ownerId !== 'user') {
                throw new Error("El usuario no tiene permiso para eliminar el producto");
            }
            const deletedProduct = await productRepository.deleteProduct(productId);
            return deletedProduct;
        } catch (error) {
            logger.error(`Error al eliminar el producto: ${error.message}`);
            throw new Error(error.message);
        }
    };
};