import { readFile } from "fs/promises"

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

export async function launchInstance(startingUrl: string): Promise<number> {
  logger.debug("Killing Chrome instances before launching a new one")
  const errors = await killAll()
  if (errors.length > 0) {
    throw new Error("Error killing instances before launching a new one")
  }

  const chromeFlags = Launcher.defaultFlags().concat([
    "--enable-accelerated-video-decode",
    "--enable-gpu-rasterization",
    "--enable-zero-copy",
    "--ignore-gpu-blocklist",
    "--kiosk",
    "--window-position=0,0",
  ])

  const sysfsSizeFile = "/sys/class/graphics/fb0/virtual_size"
  try {
    const sizeBuffer = await readFile(sysfsSizeFile)
    const windowSize = sizeBuffer.toString().trim()
    const windowSizeFlag = `--window-size=${windowSize}`
    logger.debug(`Setting "${windowSizeFlag}"`)
    chromeFlags.push(windowSizeFlag)
  } catch {
    logger.debug(`Unable to read ${sysfsSizeFile}`)
  }

  logger.info("Launching a new Chrome instance")
  const { port } = await launch({
    chromeFlags,
    startingUrl,
    logLevel: config.PROD ? "error" : "verbose",
    ignoreDefaultFlags: true,
    maxConnectionRetries: 20,
  })

  return port
}
