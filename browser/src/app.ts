import http from "http"

import { HealthCheckMap, createTerminus } from "@godaddy/terminus"
import express, { Express } from "express"

import { killInstances } from "./browser"
import { errorHandler, logger, loggingMiddleware } from "./logging"

export function createApp(): Express {
  logger.debug("Creating Express app")
  const app = express()

  app.use(loggingMiddleware)

  app.get("/favicon.ico", (req, res) => {
    res.status(204).end()
  })

  app.use(errorHandler)

  return app
}

const healthChecks: HealthCheckMap = {
  "/health": () => Promise.resolve(),
}

export function configureTerminus(app: Express): http.Server {
  logger.debug("Configuring Terminus")
  const server = http.createServer(app)

  createTerminus(server, {
    healthChecks,
    logger: logger.error,
    signals: ["SIGINT", "SIGTERM"],
    onSignal: killInstances,
  })

  return server
}
