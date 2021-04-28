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
import request from "supertest"

import { app } from "../src/app"
