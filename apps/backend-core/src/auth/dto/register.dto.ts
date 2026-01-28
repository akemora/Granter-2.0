import { IsEmail, IsString, Matches, MinLength } from "class-validator";

const PASSWORD_PATTERN = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export class AuthRegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(12)
  @Matches(PASSWORD_PATTERN, {
    message:
      "Password must include uppercase, lowercase, and numeric characters",
  })
  password!: string;
}
