import { ErrorRequestHandler } from "express"
import morgan from "morgan"
import { createLogger, format, transports } from "winston"

import config from "./config"

export const logger = createLogger({
  format: format.combine(format.errors(), format.json()),
  level: config.PROD ? "info" : "debug",
  transports: [new transports.Console()],
})

export const loggingMiddleware = morgan("combined", {
  stream: {
    write: (message) => {
      logger.http(message.trim())
    },
  },
  skip: (req, res) => config.PROD && res.statusCode < 400,
})

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }
  logger.error(err)
  res.sendStatus(500)
}
