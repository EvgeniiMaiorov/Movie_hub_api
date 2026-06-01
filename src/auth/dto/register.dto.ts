import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'john@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'john_doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}
