/* istanbul ignore file */
import { Launcher } from "chrome-launcher"

import { app } from "./app"
import { logger } from "./logging"

const port = process.env.API_PORT || 3000

try {
  Launcher.getInstallations()
} catch (error) {
  logger.error(error)
  process.exit(1)
}

app.listen(port, () => {
  logger.info(`Listening on port ${port}`)
})
