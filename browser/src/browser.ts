import { Launcher, killAll } from "chrome-launcher"

import { logger } from "./logging"

export function startupCheck(): void {
  logger.debug("Processing browser startup checks")
  try {
    Launcher.getInstallations()
  } catch (error) {
    logger.error(error)
    process.exit(1)
  }
}

export async function killInstances(): Promise<void> {
  logger.info("Killing Chrome instances")
  await killAll()
}
