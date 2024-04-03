import "dotenv/config";
import express from "express";
import morgan from "morgan";
import MainRouter from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { logger } from "./utils/logger.js"
import { __dirname, mongoStoreOptions } from "./utils/utils.js";
import handlebars from "express-handlebars";
import session from "express-session";
import passport from "passport";
import viewsRouter from "./routes/views.router.js";
import cookieParser from "cookie-parser";
import config from "./config/config.js";
import { initMongoDB } from "./config/connection.js";
import { apiDoc } from "./docs/info.js";
import swaggerUi from 'swagger-ui-express';

initMongoDB().then(() => {
  const mainRouter = new MainRouter();
  const app = express();

  app.use(session(mongoStoreOptions));

  app.use(passport.initialize());
  app.use(passport.session());

  app.engine('handlebars', handlebars.engine());
  app.set('view engine', 'handlebars');
  app.set('views', __dirname + '/views');

  app.use(express.json());
  app.use(cookieParser(config.SECRET_COOKIES))
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));

  app.use('/loggerTest', (req, res) => {
    const { level } = req.query;
    switch (level) {
      case 'debug':
        logger.debug("DEBUG en endpoint de prueba");
        break;
      case 'http':
        logger.http("HTTP en endpoint de prueba");
        break;
      case 'info':
        logger.info("INFO en endpoint de prueba");
        break;
      case 'warning':
        logger.warning("WARN en endpoint de prueba");
        break;
      case 'error':
        logger.error("ERROR en endpoint de prueba");
        break;
      case 'fatal':
        logger.fatal("FATAL en endpoint de prueba");
        break;
      default:
        logger.info("Nivel de log no válido");
        break;
    }
    res.send("Probando logger");
  })

  app.use('/api', mainRouter.getRouter());
  app.use('/views', viewsRouter);

  app.use(errorHandler);

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(apiDoc));

  const PORT = config.PORT;
  app.listen(PORT, () => logger.info(`SERVER UP ON PORT: ${PORT}`));
}).catch(error => {
  logger.error("Error conectando a MongoDB:", error);
});