import { HttpResponse } from "../utils/http.response.js";
import { logger } from "../utils/logger.js";

const htttpResponse = new HttpResponse();

export const errorHandler = (error, req, res, next) => {
    logger.error("Error:", error);
    return htttpResponse.NotFound(res, error.message);
};