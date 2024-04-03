import { HttpResponse } from "../utils/http.response.js";
import { errorsDictionary } from "../utils/http.response.js";
import { logger } from "../utils/logger.js";

const httpResponse = new HttpResponse();

export default class Controllers {
    constructor(service) {
        this.service = service;
    };

    getAll = async(req, res,  next) => {
        try{
            const items = await this.service.getAll();
            logger.info("Obteniendo todos los elementos");
            return httpResponse.Ok(res, items);
        }catch(error){
            logger.error("Error al obtener todos los elementos:", error);
            next(error);
        };
    };

    getById = async( req, res, next) => {
        try{
            const { id } = req.params;
            const item = await this.service.getById(id);
            if(!item) {
                logger.error("Elemento no encontrado:", id);
                return httpResponse.NotFound(res, "Elemento no encontrado");
            } else {
                logger.info("Elemento encontrado", item);
                return httpResponse.Ok(res, item);
            }
        }catch(error){
            logger.error("Error al obtener el elemento por ID:", error);
            next(error);
        }
    };

    create = async(req, res, next) => {
        try{
            const ownerId = req.user._id;
            const newItem = await this.service.create(req.body, ownerId);
            if(!newItem) {
                logger.error("No se pudo crear el elemento");
                return httpResponse.NotFound(res, errorsDictionary.ERROR_CREATE_ITEM);
            } else {
                logger.info("Elemento creado correctamente:", newItem);
                return httpResponse.Ok(res, newItem);
            }
        }catch(error){
            logger.error("Error al crear el elemento:", error);
            next(error);
        }
    };

    update = async(req, res, next) => {
        try {
            const { id } = req.params;
            const item = await this.service.getById(id);
            if(!item) {
                logger.error("Elemento no encontrado para actualizar:", id);
                return httpResponse.NotFound(res, errorsDictionary.ERROR_UPDATE_ITEM);
            } else {
                const itemUpd = await this.service.update(id, req.body);
                logger.info("Elemento actualizado correctamente:", itemUpd);
                return httpResponse.Ok(res, itemUpd);
            }
        }catch(error){
            logger.error("Error al actualizar el elemento:", error);
            next(error.message);
        }
    };

    delete = async(req, res, next) => {
        try{
            const { id } = req.params;
            const item = await this.service.getById(id);
            if(!item) {
                logger.error("Elemento no encontrado para eliminar:", id);
                return httpResponse.NotFound(res, errorsDictionary.ERROR_DELETE_ITEM);
            } else {
                const itemDel = await this.service.delete(id);
                logger.info("Elemento eliminado correctamente:", itemDel);
                return httpResponse.Ok(res, itemDel);          
            };
        }catch(error){
            logger.error("Error al eliminar el elemento:", error);
            next(error.message);
        }
    };
}