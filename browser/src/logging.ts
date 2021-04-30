import { ErrorRequestHandler } from "express"
import morgan from "morgan"
import { createLogger, format, transports } from "winston"

export const logger = createLogger({
  format: format.combine(format.errors(), format.json()),
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transports: [new transports.Console()],
})

export const loggingMiddleware = morgan("combined", {
  stream: {
    write: (message) => {
      logger.http(message.trim())
    },
  },
  skip: (req, res) =>
    process.env.NODE_ENV === "production" && res.statusCode < 400,
})

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }
  logger.error(err)
  res.sendStatus(500)
}
