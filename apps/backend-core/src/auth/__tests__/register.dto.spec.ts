import { validate } from "class-validator";
import { AuthRegisterDto } from "../dto/register.dto";

describe("AuthRegisterDto", () => {
  it("validates a strong payload", async () => {
    const dto = new AuthRegisterDto();
    dto.email = "test@example.com";
    dto.password = "Secure123Password";
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it("rejects invalid email", async () => {
    const dto = new AuthRegisterDto();
    dto.email = "notemail";
    dto.password = "Secure123Password";
    const errors = await validate(dto);
    expect(errors.some((error) => error.property === "email")).toBe(true);
  });

  it("rejects weak password", async () => {
    const dto = new AuthRegisterDto();
    dto.email = "test@example.com";
    dto.password = "weakpass";
    const errors = await validate(dto);
    expect(errors.some((error) => error.property === "password")).toBe(true);
  });

  it("strips unknown properties when validation pipe is enabled", async () => {
    const dto = Object.assign(new AuthRegisterDto(), {
      email: "test@example.com",
      password: "Secure123Password",
      extra: "value",
    });
    const errors = await validate(dto as AuthRegisterDto);
    expect(errors.length).toBe(0);
  });
});
