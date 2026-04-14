import { IsEmail, IsIn, IsNotEmpty, IsOptional, MinLength } from "class-validator";

export class RegisterDto {
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @MinLength(6)
    password: string;

    @IsOptional()
    @IsIn(['admin', 'user'])
    role?: string;
}
