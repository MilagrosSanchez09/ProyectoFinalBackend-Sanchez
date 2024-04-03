import Controllers from "./class.controller.js";
import ProductService from "../services/product.services.js";
import { HttpResponse, errorsDictionary } from "../utils/http.response.js";
import { logger } from "../utils/logger.js";

const httpResponse = new HttpResponse();
const productService = new ProductService();

export default class ProductController extends Controllers {
    constructor() {
        super(productService);
    };

    async generateMockedProducts(req, res, next) {
        try {
            const mockedProducts = await productService.generateMockedProducts();
            logger.info("Productos simulados generados:", mockedProducts);
            return httpResponse.Ok(res, mockedProducts);
        } catch (error) {
            logger.error("Error al generar los productos simulados:", error);
            next(error);
        }
    }

    async createProduct(req, res, next) {
        try {
            const ownerId = req.user_id;
            console.log("ownerId en el controlador:", ownerId);
            const userRole = req.user_role;
            const product = req.body;
            const newProduct = await productService.createProduct(product, userRole, ownerId);
            if (!newProduct) {
                logger.error("No se pudo crear el producto:", errorsDictionary.ERROR_CREATE_ITEM);
                return httpResponse.NotFound(res, errorsDictionary.ERROR_CREATE_ITEM);
            } else {
                logger.info("Producto creado correctamente:", newProduct);
                return httpResponse.Ok(res, newProduct);
            }
        } catch (error) {
            logger.error("Error al crear el producto:", error);
            next(error);
        }
    }

    async getProductById(req, res, next) {
        try {
            const { id } = req.params;
            const product = await productService.getProductById(id);
            if (!product) {
                logger.error("Producto no encontrado:", id);
                return httpResponse.NotFound(res, errorsDictionary.ERROR_FIND_ITEM);
            } else {
                logger.info("Producto encontrado:", product);
                return httpResponse.Ok(res, product);
            }
        } catch (error) {
            logger.error("Error al obtener el producto por ID:", error);
            next(error);
        }
    }

    async deleteProduct(req, res, next) {
        try {
            const productId = req.params.productId;
            const ownerId = req.user_id;
            const isAdmin = req.isAdmin;
            
            const deletedProduct = await productService.deleteProduct(productId, ownerId, isAdmin);

            if (!deletedProduct) {
                logger.error("No se pudo eliminar el producto:", productId);
                return httpResponse.NotFound(res, errorsDictionary.ERROR_DELETE_ITEM);
            } else {
                logger.info("Producto eliminado correctamente:", productId);
                return httpResponse.Ok(res, { message: 'Producto eliminado correctamente' });
            }
        } catch (error) {
            logger.error("Error al eliminar el producto:", error);
            next(error);
        }
    }
}