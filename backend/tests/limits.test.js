import { jest } from "@jest/globals";
import rateLimiter from "../util/rate-limiter.js";

describe("Rate limiting", () => {
  test("Rate limiting", () => {
    rateLimitCheck = jest.fn(rateLimiter);

    const MOCKING_DATA = { socket: { remoteAddress: "1.2.3.4" } };
    const MOCKING_TIMES = 1000;

    for (let i = 0; i < MOCKING_TIMES; ++i) rateLimitCheck(MOCKING_DATA);

    expect(rateLimitCheck).toHaveNthReturnedWith(5, false);
    expect(rateLimitCheck).toHaveLastReturnedWith(true);
  });
});
