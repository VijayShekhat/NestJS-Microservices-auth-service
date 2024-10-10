import { Exclude } from "class-transformer";
import { IsEmail, IsNotEmpty } from "class-validator";


export class LoginUserDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @Exclude()
    password: string;
}