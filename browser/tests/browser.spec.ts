import { readFile } from "fs/promises"

import { LaunchedChrome, Launcher, killAll, launch } from "chrome-launcher"
import { mocked } from "ts-jest/utils"

import { killInstances, launchInstance, startupCheck } from "../src/browser"

jest.mock("fs/promises")
const mockedReadFile = mocked(readFile)
jest.mock("chrome-launcher")
const mockedLauncher = mocked(Launcher)
const mockedKillAll = mocked(killAll)
const mockedLaunch = mocked(launch)

beforeEach(() => {
  jest.clearAllMocks()
})

describe("startupCheck()", () => {
  const mockExit = jest
    .spyOn(process, "exit")
    .mockImplementation((() => null) as () => never)

  afterAll(() => {
    mockExit.mockRestore()
  })

  test("does nothing with found installation", () => {
    mockedLauncher.getInstallations.mockImplementation(() => [])
    startupCheck()
    expect(mockedLauncher.getInstallations).toHaveBeenCalledTimes(1)
    expect(mockExit).not.toHaveBeenCalled()
  })

  test("exits the application if no installation is found", () => {
    mockedLauncher.getInstallations.mockImplementation(() => {
      throw new Error("test error")
    })
    startupCheck()
    expect(mockedLauncher.getInstallations).toHaveBeenCalledTimes(1)
    expect(mockExit).toHaveBeenCalledWith(1)
  })
})

test("killInstances() calls killAll", async () => {
  mockedKillAll.mockResolvedValue([])
  await killInstances()
  expect(mockedKillAll).toHaveBeenCalled()
})

describe("launchInstance()", () => {
  test("fails if killAll return errors", () => {
    mockedKillAll.mockResolvedValue([new Error("test error")])
    return expect(launchInstance("")).rejects.toThrow("Error killing instances")
  })

  test("launches an instance", async () => {
    mockedKillAll.mockResolvedValue([])
    mockedLauncher.defaultFlags.mockReturnValue([])
    mockedReadFile.mockResolvedValue(Buffer.from("1,2"))
    mockedLaunch.mockResolvedValue({ port: 42 } as LaunchedChrome)
    const port = await launchInstance("testurl")
    expect(mockedKillAll).toHaveBeenCalled()
    expect(mockedLauncher.defaultFlags).toHaveBeenCalled()
    expect(mockedLaunch).toHaveBeenCalledWith(
      expect.objectContaining({ startingUrl: "testurl" })
    )
    expect(port).toEqual(42)
  })
})
