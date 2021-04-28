import { app } from "./app"

import { logger } from "./logging"

const port = process.env.API_PORT || 3000

app.listen(port, () => {
  logger.info(`Listening on port ${port}`)
})
