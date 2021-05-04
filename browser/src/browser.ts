import { Launcher, killAll, launch } from "chrome-launcher"

import config from "./config"
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

const chromeFlags = ["--kiosk"]

export async function launchInstance(startingUrl: string): Promise<number> {
  logger.debug("Killing Chrome instances before launching a new one")
  const errors = await killAll()
  if (errors.length > 0) {
    throw new Error("Error killing instances before launching a new one")
  }

  logger.debug("Launching new Chrome instance")
  const { port } = await launch({
    chromeFlags,
    startingUrl,
    logLevel: config.PROD ? "silent" : "info",
    maxConnectionRetries: 20,
  })

  return port
}
