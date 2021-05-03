import http from "http"

import { HealthCheckMap, createTerminus } from "@godaddy/terminus"
import express, { Express } from "express"

import { killInstances, launchInstance } from "./browser"
import { errorHandler, logger, loggingMiddleware } from "./logging"

interface UrlReqBody {
  url?: string
}

export function createApp(): Express {
  logger.debug("Creating Express app")
  const app = express()

  app.use(loggingMiddleware)
  app.use(express.urlencoded({ extended: true }))

  app.get("/favicon.ico", (req, res) => {
    res.status(204).end()
  })

  app.post("/browser", (req, res, next) => {
    const { url } = req.body as UrlReqBody
    if (!url) {
      res.status(400).send("Bad Request: missing URL in body")
      return next()
    }
    launchInstance(url)
      .then((port) => {
        res.json({ devPort: port })
      })
      .catch(next)
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
