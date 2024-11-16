import { IsString, IsEmail, IsDecimal } from 'class-validator';

export class CreateUserDto {
   @IsString()
   name: string;

   @IsEmail()
   email: string;

   @IsDecimal()
   latitude: number;

   @IsDecimal()
   longitude: number;
}
