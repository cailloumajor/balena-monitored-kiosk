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
import { mocked } from "ts-jest/utils"

import { createApp, configureTerminus } from "../src/app"
import { launchInstance } from "../src/browser"

jest.mock("../src/browser")
const mockedLaunchInstance = mocked(launchInstance)

beforeEach(() => {
  jest.clearAllMocks()
})

test("health check endpoint", () => {
  const app = express()
  const server = configureTerminus(app)
  return request(server).get("/health").expect(200).expect({ status: "ok" })
})

describe("browser endpoint", () => {
  test("fails if url is missing in request", () => {
    return request(createApp()).post("/browser").send("").expect(400)
  })

  test("fails if launchInstance fails", () => {
    mockedLaunchInstance.mockRejectedValue(new Error("testing error"))
    return request(createApp())
      .post("/browser")
      .send("url=test_url")
      .expect(500)
  })

  test("succeeds", () => {
    mockedLaunchInstance.mockResolvedValue(1234)
    return request(createApp())
      .post("/browser")
      .send("url=testurl")
      .expect("Content-Type", /json/)
      .expect(200, { devPort: 1234 })
      .then(() => {
        expect(mockedLaunchInstance).toHaveBeenCalledWith("testurl")
      })
  })
})

test("favicon request", () =>
  request(createApp()).get("/favicon.ico").expect(204))
