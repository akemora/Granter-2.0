import { ForbiddenException } from "@nestjs/common";
import { ExecutionContext } from "@nestjs/common";
import { XServiceTokenGuard } from "../x-service-token.guard";

describe("XServiceTokenGuard", () => {
  const guard = new XServiceTokenGuard();

  const createContext = (headerValue?: string): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          header: () => headerValue,
        }),
      }),
    }) as unknown as ExecutionContext;

  afterEach(() => {
    delete process.env.SERVICE_TOKEN;
  });

  it("allows requests with a valid token", () => {
    process.env.SERVICE_TOKEN = "very-secure-token";
    const context = createContext("very-secure-token");
    expect(guard.canActivate(context)).toBe(true);
  });

  it("rejects requests with invalid token", () => {
    process.env.SERVICE_TOKEN = "secure-token";
    const context = createContext("invalid-value");
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it("rejects when header missing", () => {
    process.env.SERVICE_TOKEN = "secure-token";
    const context = createContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it("rejects when SERVICE_TOKEN unset", () => {
    const context = createContext("value");
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
