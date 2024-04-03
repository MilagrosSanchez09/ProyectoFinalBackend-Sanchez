import { logger } from "../utils/logger.js";

export default class Services {
    constructor(dao) {
        this.dao = dao;
    };

    getAll = async () => {
        try {
            const items = await this.dao.getAll();
            if (!items) {
                logger.error("No se pudieron obtener los elementos");
                return false;
            } else {
                logger.info("Elementos obtenidos exitosamente");
                return items;
            }
        } catch (error) {
            logger.error(`Error al obtener todos los elementos: ${error.message}`);
            throw new Error(error);
        };
    };

    getById = async (id) => {
        try {
            const item = await this.dao.getById(id);
            if (!item) {
                logger.error(`Elemento con ID ${id} no encontrado`);
                return false;
            } else {
                logger.info(`Elemento con ID ${id} encontrado`);
                return item;
            }
        } catch (error) {
            logger.error(`Error al obtener elemento por ID ${id}: ${error.message}`);
            throw new Error(error);
        };
    };

    create = async (productData, ownerId) => {
        try {
            const newItem = await this.dao.create(productData, ownerId);
            if (!newItem) {
                logger.error('No se pudo crear el nuevo elemento');
                return false;
            } else {
                logger.info('Nuevo elemento creado exitosamente');
                return newItem;
            }
        } catch (error) {
            logger.error(`Error al crear un nuevo elemento: ${error.message}`);
            throw new Error(error);
        };
    };

    update = async (id, obj) => {
        try {
            const item = await this.dao.getById(id);
            if (!item) {
                logger.error(`Elemento con ID ${id} no encontrado, no se puede actualizar`);
                return false;
            } else {
                await this.dao.update(id, obj);
                logger.info(`Elemento con ID ${id} actualizado exitosamente`);

            }
        } catch (error) {
            logger.error(`Error al actualizar el elemento con ID ${id}: ${error.message}`);
            throw new Error(error);
        };
    };

    delete = async (id) => {
        try {
            const item = await this.dao.getById(id);
            if (!item) {
                logger.error(`Elemento con ID ${id} no encontrado, no se puede eliminar`);
                return false;
            } else {
                await this.dao.delete(id);
                logger.info(`Elemento con ID ${id} eliminado exitosamente`);
            }
        } catch (error) {
            logger.error(`Error al eliminar el elemento con ID ${id}: ${error.message}`);
            throw new Error(error);
        };
    };
};