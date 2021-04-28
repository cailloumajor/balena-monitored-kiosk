import morgan from "morgan"
import winston from "winston"

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transports: [new winston.transports.Console()],
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
