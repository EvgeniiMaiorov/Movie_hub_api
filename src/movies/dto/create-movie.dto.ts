import { IsInt, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateMovieDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsInt()
  releaseYear: number;

  @IsString()
  genre: string;

  @IsNumber()
  @Min(0)
  @Max(10)
  rating: number;
}
