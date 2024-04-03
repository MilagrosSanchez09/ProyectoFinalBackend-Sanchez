import winston from "winston";
import "winston-mongodb";
import config from "../config/config.js";

const logLevels = {
  debug: 0,
  http: 1,
  info: 2,
  warning: 3,
  error: 4,
  fatal: 5 
};

const developmentLogger = winston.createLogger({
  levels: logLevels,
  transports: [
    new winston.transports.Console({ level: "error" }),
  ],
});

const productionLogger = winston.createLogger({
  levels: logLevels,
  transports: [
    winston.add(
      new winston.transports.MongoDB({
        options: { useUnifiedTopology: true },
        db: config.MONGO_URL,
        collection: "logs",
        tryReconnect: true,
        level: "error",
      }),
    ),
      new winston.transports.File({ filename: "./logs.log", level: "info" }),
  ]
});

const logger = process.env.NODE_ENV === 'production' ? productionLogger: developmentLogger;

export { logger };