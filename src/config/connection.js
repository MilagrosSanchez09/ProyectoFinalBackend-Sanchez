import { connect } from "mongoose";
import config from "./config.js";
import { logger } from "../utils/logger.js";

const connectionString = config.MONGO_URL;

export const initMongoDB = async () => {
  try {
    await connect(connectionString);
    logger.info("Conectado a la base de datos de MongoDB");
  } catch (error) {
    logger.error("Error al conectar a la base de datos de MongoDB:", error);
  }
};