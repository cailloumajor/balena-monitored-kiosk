import express from "express"

import { loggingMiddleware } from "./logging"

export const app = express()

app.use(loggingMiddleware)
