import MongoDao from "../mongo.dao.js";
import { UserModel } from "./user.model.js";
import { createHash, isValidPassword } from "../../../../utils/utils.js";
import jwt from "jsonwebtoken";
import config from "../../../../config/config.js";
import { logger } from "../../../../utils/logger.js";
import 'dotenv/config';
import { sendMail } from "../../../../services/mailing.user.services.js";

const SECRET_KEY_JWT = config.SECRET_KEY_JWT;

export default class UserMongoDao extends MongoDao {
    constructor() {
        super(UserModel);
    };
    generateToken(user, timeExp) {
        const payload = {
            userId: user._id,
        };
        const token = jwt.sign(payload, SECRET_KEY_JWT, {
            expiresIn: timeExp,
        });
        return token;
    };

    async register(user, role) {
        try {
            const { email, password } = user;
            const existUser = await this.model.findOne({ email });
            if (!existUser) {
                const newUser = await this.model.create({
                    ...user,
                    role: role || 'user',
                    password: createHash(password)
                });
                logger.info(`Usuario registrado exitosamente: ${email}`);
                return newUser;
            } else {
                logger.error(`El usuario ya existe: ${email}`);
                return null;
            }
        } catch (error) {
            logger.error(`Error al registrar el usuario: ${error.menssage}`);
            throw new Error(error.message);
        };
    };

    async login(user) {
        try {
            const { email } = user;
            const userExist = await this.getByEmail(email);
            return userExist;
        } catch (error) {
            logger.error(`Error al iniciar sesión: ${error.message}`);
            throw new Error(error.message);
        };
    };

    async logout(user){
        try {
            await user.save();
            return true;
        } catch (error) {
            throw new Error("Error al cerrar sesión: " + error.message);
        }
    }

    async getByEmail(email) {
        try {
            const user = await this.model.findOne({ email });
            if (!user) {
                logger.warn(`Usuario no encontrado para el email: ${email}`);
                return null;
            };
            logger.info(`Usuario encontrado pra el email: ${email}`);
            return user;
        } catch (error) {
            logger.error(`Error al buscar usuario por email: ${error.menssage}`);
            throw error;
        };
    };

    async resetPassword(user) {
        try {
            const { email } = user;
            const userExist = await this.getByEmail(email);
            if (userExist) {
                const token = this.generateToken(userExist, "1h");
                await this.model.updateOne(
                    { email: email },
                    { resetPasswordToken: token, resetPasswordExpires: Date.now() + 3600000 }
                )
                logger.info(`Solicitud de restablecimiento de contraseña generada para el usuario: ${email}`);
                return token;
            } else {
                logger.warn(`No se pudo encontrar el usuario para la solicitud: ${email}`);
                return false;
            };
        } catch (error) {
            logger.error(`Error al restrablecer la contraseña: ${error.menssage}`);
            throw new Error(error.menssage);
        };
    };

    async updatePassword(user, password) {
        try {
            const isEqual = isValidPassword(user, password);
            if (isEqual) {
                return false
            } else {
                const newPass = createHash(password);
                return (
                    await this.update(user_id, { password: newPass })
                );
            };
        } catch (error) {
            logger.error(`Error al actualizar la contraseña: ${error.message}`);
            throw new Error(error.menssage);
        };
    };

    async upgradeToPremium(userId) {
        try {
            const user = await this.getById(userId);
            if (!user) {
                logger.error(`Usuario no encontrado para ID: ${userId}`);
                return null;
            }
            user.role = 'premium';
            await user.save();
            logger.info(`Usuario actualizado a premiumm con éxito: ${userId}`);
            return user;
        } catch (error) {
            logger.error(`Error al actualizar a premium: ${error.message}`);
            throw new Error(error.message);
        }
    }

    async uploadDocuments(userId, documents) {
        try {
            const user = await this.getById(userId);
            if (!user) {
                logger.error(`Usuario no encontrado para ID: ${userId}`);
                return null;
            }
            user.documents = documents;
            await user.save();
            logger.info(`Documentos subidos con éxito para el usuario: ${userId}`);
            return user;
        } catch (error) {
            logger.error(`Error al subir los documentos del usuario: ${error.message}`);
            throw new Error(error.message);
        }
    };

    async getAllUsers() {
        try {
            const users = await this.model.find({}, { _id: 0, first_name: 1, last_name: 1, email: 1, role: 1 });
            return users;
        } catch (error) {
            logger.error(`Error al obtener todos los usuarios: ${error.message}`);
            throw new Error(error.message);
        }
    };

    async deleteInactiveUsers(requestingUserId) {
        try {
            const requestingUser = await UserModel.findById(requestingUserId);
            if (!requestingUser){
                throw new Error("El usuario solicitante no existe");
            }
            if (requestingUser.role !== 'admin'){
                throw new Error("El usuario no tiene permisos para realizar esta acción");
            }
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            const deletedUsers = await UserModel.find({ last_connection: { $lt: twoDaysAgo } });
            for (const deletedUser of deletedUsers) {
                await UserModel.findByIdAndDelete(deletedUser._id);
                const { email } = deletedUser;
                const asunto = 'Eliminación de cuenta por inactividad';
                const contenido = 'Tu cuenta ha sido eliminada debido a la inactividad';
                await sendMail(email, asunto, contenido);
            }
            return deletedUsers;
        } catch (error) {
            logger.error(`Error al eliminar usuarios inactivos: ${error.message}`);
            throw new Error(error.message);
        }
    };

    async deleteProduct(productId) {
        try {
            const product = await UserModel.findById(productId);
            if (!product) {
                throw new Error("Producto no encontrado");
            }
            const deletedProduct = await UserModel.findByIdAndDelete(productId);
            if (deletedProduct) {
                if (product.product_owner.role === 'premium') {
                    await sendMail(product.product_owner, 'productDeletion', product.product_name);
                }
                return deletedProduct;
            }
        } catch (error) {
            logger.error(`Error al eliminar producto: ${error.message}`);
            throw new Error(error.message);
        }
    }
};