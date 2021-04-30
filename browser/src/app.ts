import http from "http"

import { createTerminus, HealthCheckMap } from "@godaddy/terminus"
import { killAll } from "chrome-launcher"
import express from "express"

import { errorHandler, logger, loggingMiddleware } from "./logging"

const expressApp = express()

expressApp.use(loggingMiddleware)

expressApp.get("/favicon.ico", (req, res) => {
  res.status(204).end()
})

expressApp.use(errorHandler)

const healthChecks: HealthCheckMap = {
  "/health": () => Promise.resolve(),
}

/* istanbul ignore next */
async function onSignal() {
  logger.info("Killing Chrome instances")
  await killAll()
}

export const app = createTerminus(http.createServer(expressApp), {
  healthChecks,
  logger: logger.error,
  signals: ["SIGINT", "SIGTERM"],
  onSignal,
})
