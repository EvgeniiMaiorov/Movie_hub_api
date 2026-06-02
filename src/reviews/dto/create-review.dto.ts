import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    example: 'Amazing movie with deep emotional story',
  })
  @IsString()
  text: string;

  @ApiProperty({
    example: 9,
  })
  @IsInt()
  @Min(1)
  @Max(10)
  rating: number;

  @ApiProperty({
    example: 1,
    description: 'ID of the movie being reviewed',
  })
  @IsInt()
  movieId: number;
}
