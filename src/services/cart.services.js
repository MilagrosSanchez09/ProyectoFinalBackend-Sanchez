import Services from "./class.services.js";
import persistence from "../persistence/persistence.js";
import { logger } from "../utils/logger.js";

const { cartDao, productDao } = persistence;

export default class CartService extends Services {
  constructor() {
    super(cartDao);
  };

  async create(userId, cartData) {
    try {
      const newCart = await cartDao.create(userId, cartData);
      return newCart;
    } catch (error) {
      logger.error(`Error al crear el carrito: ${error.message}`);
      throw new Error(error);
    }
  }

  async remove(id) {
    try {
      const cartDel = await cartDao.delete(id);
      if (!cartDel) {
        logger.error(`No se pudo eliminar el carrito con ID: ${id}`);
        return false;
      } else {
        logger.info(`Carrito eliminado con ID: ${id}`);
        return cartDel;
      }
    } catch (error) {
      logger.error(`Error al eliminar el carrito: ${error.message}`);
      throw new Error(error);
    }
  };

  async addProdToCart(cartId, prodId) {
    try {
      const existCart = await cartDao.getById(cartId);
      if (!existCart) {
        logger.error(`Carrito con ID ${cartId} no encontrado`);
        return false;
      }
      const existProd = await productDao.getById(prodId);
      if (!existProd) {
        logger.error(`Producto con ID ${prodId} no encontrado`);
        return false;
      }

      const existProdInCart = existCart.products.find((p) => p.product._id.toString() === prodId.toString());

      if (existProdInCart) {
        existProdInCart.quantity++;
        existCart.save();
        logger.info(`Producto agregado al carrito (ID del carrito: ${cartId}, ID del producto: ${prodId})`);
        return existProdInCart;
      } else {
        await cartDao.addProdToCart(existCart, prodId);
        logger.info(`Producto agregado al carrito (ID del carrito: ${cartId}, ID del producto: ${prodId})`);
      }
    } catch (error) {
      logger.error(`Error al agregar producto al carrito: ${error.message}`);
      throw new Error(error);
    }
  };

  async removeProdToCart(cartId, prodId) {
    try {
      const existCart = await cartDao.getById(cartId);
      if (!existCart) {
        throw new Error("Carrito no encontrado");
      }

      const existProd = await productDao.getById(prodId);
      if (!existProd) {
        throw new Error("Producto no encontrado");
      }

      const existProdInCart = existCart.products.find((p) => p.product._id.toString() === prodId.toString());

      if (existProdInCart && existProdInCart.quantity > 0) {
        existProdInCart.quantity--;
        await existCart.save();
        logger.info(`Producto eliminado del carrito (ID del carrito: ${cartId}, ID del producto: ${prodId})`);
        return existProdInCart;
      } else {
        await cartDao.removeProdToCart(existCart, prodId);
        logger.info(`Producto eliminado del carrito (ID del carrito: ${cartId}, ID del producto: ${prodId})`);
      }
    } catch (error) {
      logger.error(`Error al eliminar producto del carrito: ${error.message}`);
      throw new Error("Error al eliminar producto del carrito");
    }
  };

  async updateProdQuantityToCart(cartId, prodId, quantity) {
    try {
      const existCart = await getById(cartId);
      if (!existCart) return false;

      const existProd = existCart.products.find((p) => p.product._id.toString() === prodId.toString());
      if (!existProd) return false;

      return await cartDao.updateProdQuantityToCart(existCart, existProd, quantity);
    } catch (error) {
      logger.error(`Error al actualizar la cantidad de productos en el carrito: ${error.message}`);
      throw new Error(error);
    }
  };

  async clearCart(cartId) {
    try {
      const existCart = await cartDao.getById(cartId);
      if (!existCart) {
        logger.error(`Carrito con ID ${cartId} no encontrado`);
        return false;
      } else {
        await cartDao.clearCart(existCart);
        logger.info(`Carrito limpiado (ID: ${cartId})`);
        return true;
      }
    } catch (error) {
      logger.error(`Error al limpiar el carrito: ${error.message}`);
      throw new Error("Error al limpiar el carrito");
    }
  };

  async getById(id) {
    try {
      const cart = await cartDao.getById(id);
      return cart;
    } catch (error) {
      logger.error(`Error al recuperar el carrito por ID: ${error.message}`);
      throw new Error(error);
    }
  };

  async getAllByUser(userId) {
    try {
      const carts = await cartDao.getAllByUser(userId);
      return carts;
    } catch (error) {
      logger.error(`Error al obtener los carritos del usuario con ID ${userId}: ${error.message}`);
      throw new Error("Error al obtener los carritos del usuario");
    }
  };
}