import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNumber, Min, Max } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: "The user's full name",
    example: 'John Doe',
  })
  @IsString({ message: 'Name must be a valid string' })
  name: string;

  @ApiProperty({
    description: "The user's email address",
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @ApiProperty({
    description:
      "The user's latitude coordinate, within Egypt's geographical boundaries",
    example: 30.0456789,
    minimum: 22.0,
    maximum: 31.5,
  })
  @IsNumber(
    { maxDecimalPlaces: 8, allowInfinity: false, allowNaN: false },
    { message: 'Latitude must be a valid number with up to 8 decimal places' },
  )
  @Min(22.0, {
    message: 'Latitude must not be less than 22.0 (South of Egypt)',
  })
  @Max(31.5, {
    message: 'Latitude must not be more than 31.5 (North of Egypt)',
  })
  latitude: number;

  @ApiProperty({
    description:
      "The user's longitude coordinate, within Egypt's geographical boundaries",
    example: 31.2345678,
    minimum: 24.7,
    maximum: 36.9,
  })
  @IsNumber(
    { maxDecimalPlaces: 8, allowInfinity: false, allowNaN: false },
    { message: 'Longitude must be a valid number with up to 8 decimal places' },
  )
  @Min(24.7, {
    message: 'Longitude must not be less than 24.7 (West of Egypt)',
  })
  @Max(36.9, {
    message: 'Longitude must not be more than 36.9 (East of Egypt)',
  })
  longitude: number;
}
