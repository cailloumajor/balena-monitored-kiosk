/* eslint jest/expect-expect: [
    "warn",
    {
      "assertFunctionNames": [
        "expect",
        "request.**.expect"
      ]
    }
  ]
*/
import express from "express"
import request from "supertest"

import { createApp, configureTerminus } from "../src/app"

test("health check endpoint", () => {
  const app = express()
  const server = configureTerminus(app)
  return request(server).get("/health").expect(200).expect({ status: "ok" })
})

test("favicon request", () =>
  request(createApp()).get("/favicon.ico").expect(204))
