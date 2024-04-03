import Services from "./class.services.js";
import persistence from "../persistence/persistence.js";
import { sendMail } from "./mailing.user.services.js";
import { logger } from "../utils/logger.js";
import { isValidPassword } from "../utils/utils.js";
import jwt from "jsonwebtoken";
import "../config/config.js";

const { userDao } = persistence;

export default class UserService extends Services {
  constructor() {
    super(userDao);
    this.dao = userDao;
    logger.info('UserDao in constructor:', userDao);
    logger.info('this.dao in constructor:', this.dao);
  }

  async register(user, role) {
    try {
      logger.info('UserDao in register:', userDao);
      const response = await this.dao.register(user, role);
      await sendMail(user, 'register');
      return response;
    } catch (error) {
      logger.error('Error in register:', error.message);
      throw new Error(error.message);
    };
  };

  async login(user) {
    try {
      console.log("SECRET_KEY_JWT:", process.env.SECRET_KEY_JWT);
      const { email, password } = user;
      const userExist = await this.dao.login(user);
      if (!userExist){
        return null;
      } else {
        const passValid = isValidPassword(userExist, password);
        if (!passValid) return false;
        else {
          userExist.last_connection = new Date();
          await userExist.save();
          const token = jwt.sign({ userId: userExist._id }, process.env.SECRET_KEY_JWT, { expiresIn: '15m' });
          logger.info(`Usuario autenticado exitosamente: ${email}`);
          return { user: userExist, token };
        }
      }
    } catch (error) {
      logger.error('Error al iniciar sesión:', error.message);
      throw new Error(error.message);
    };
  };

  async logout(user) {
    try {
      const success = await this.dao.logout(user);
      if (success) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      logger.error("Error al cerrar sesión:", error);
      throw new Error(error.message);
    }
  }

  async resetPassword(user) {
    try {
      const token = await this.dao.resetPassword(user);
      if (token) {
        await sendMail(user, 'resetPassword', token);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      logger.error('Error in resetPassword:', error.message);
      throw new Error(error.message);
    };
  };

  async updatePassword(user, password) {
    try {
      const response = await this.dao.updatePassword(user, password);
      if (!response) {
        return false
      } else {
        return response;
      };
    } catch (error) {
      logger.error('Error in updatePassword:', error.message);
      throw new Error(error.message);
    };
  };

  async upgradeToPremium(userId) {
    try {
      const response = await this.dao.upgradeToPremium(userId);
      return response;
    } catch (error) {
      logger.error('Error al actualizar al usuario a premium:', error.message);
      throw new Error(error.message);
    }
  }

  async uploadDocuments(userId, documents) {
    try {
      const response = await this.dao.uploadDocuments(userId, documents);
      return response;
    } catch (error) {
      logger.error('Error al subir documentos del usuario:', error.message);
      throw new Error(error.message);
    }
  }

  async getAllUsers() {
    try {
      const users = await this.dao.getAllUsers();
      return users.map(user => ({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      }));
    } catch (error) {
      logger.error(`Error al obtener todos los usuarios: ${error.message}`);
      throw new Error(error.message);
    }
  }

  async deleteInactiveUsers(requestingUserId) {
    try {
      const deletedUsers = await this.dao.deleteInactiveUsers(requestingUserId);
      for (const user of deletedUsers) {
        const { email } = user;
        await sendMail(user, 'accountDeletion');
      }
      return deletedUsers;
    } catch (error) {
      logger.error(`Error al eliminar usuarios inactivos: ${error.message}`);
      throw new Error(error.message);
    }
  }

  async deleteProduct(productId, userId) {
    try {
      const user = await this.dao.getById(userId);
      if (!user) {
        throw new Error("Usuario no encontrado");
      }
      let deletedProduct;
      if (user.role === 'premium' && user.email){
        deletedProduct = await this.dao.deleteProduct(productId);
        await sendMail(user, 'productDeletion');
      } else {
        deletedProduct = await this.dao.deleteProduct(productId);
      }
      return deletedProduct;
    } catch (error) {
      logger.error(`Error al eliminar producto: ${error.message}`);
      throw new Error(error.message);
    }
  }
};