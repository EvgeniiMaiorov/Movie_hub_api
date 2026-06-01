import { IsInt, IsNumber, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMovieDto {
  @ApiProperty({
    example: 'Interstellar',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: 2014,
  })
  @IsInt()
  releaseYear: number;

  @ApiProperty({
    example: 'Sci-Fi',
  })
  @IsString()
  genre: string;

  @ApiProperty({
    example: 8.6,
  })
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(10)
  rating: number;
}
