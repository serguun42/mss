import { jest } from "@jest/globals";
import createBackendServer from "../backend-server.js";

jest.useFakeTimers();

describe("Whole Backend", () => {
  /** @type {import('http').Server} */
  let server;

  beforeAll(() => {
    server = createBackendServer().listen(15077);
  });

  beforeEach(() => {
    jest.setTimeout(2000);
  });

  test("Server is up", async () => {
    const statusCode = await fetch("http://localhost:15077").then((res) => res.status);

    expect(statusCode).toBeGreaterThanOrEqual(200);
    expect(statusCode).toBeLessThan(500);

    return Promise.resolve();
  });

  test("Server API is working", async () => {
    const pongMessage = await fetch("http://localhost:15077/api/v1.3/ping").then((res) => res.json());
    expect(pongMessage).toEqual({ message: "pong" });

    return Promise.resolve();
  });

  afterAll(() => {
    server.close();
  });
});
