/* eslint jest/expect-expect: [
    "warn",
    {
      "assertFunctionNames": [
        "expect",
        "appRequest.**.expect"
      ]
    }
  ]
*/
import request from "supertest"

import { app } from "../src/app"

const appRequest = request(app)

test("health check endpoint", () =>
  appRequest.get("/health").expect(200).expect({ status: "ok" }))

test("favicon request", () => appRequest.get("/favicon.ico").expect(204))
