/* istanbul ignore file */
import { createApp, configureTerminus } from "./app"
import { startupCheck } from "./browser"
import config from "./config"
import { logger } from "./logging"

function main(): void {
  startupCheck()
  const app = createApp()
  const server = configureTerminus(app)
  server.listen(config.PORT, () => {
    logger.info(`Listening on port ${config.PORT}`)
  })
}

if (require.main === module) {
  main()
}
