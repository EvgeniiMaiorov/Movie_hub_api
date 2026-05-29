import { Injectable } from '@nestjs/common';
import { Movie } from './interfaces/movie.interface';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MoviesService {
  private movies: Movie[] = [];

  findAll(): Movie[] {
    return this.movies;
  }

  findById(id: number): Movie | null {
    return this.movies.find((movie) => movie.id === id) || null;
  }

  create(createMovieDto: CreateMovieDto): Movie {
    const newMovie = {
      id: this.movies.length + 1,
      ...createMovieDto,
    };

    this.movies.push(newMovie);

    return newMovie;
  }

  update(id: number, updatedMovieDto: UpdateMovieDto): Movie | null {
    const movieIndex = this.movies.findIndex((movie) => movie.id === id);

    if (movieIndex < 0) {
      return null;
    }

    this.movies[movieIndex] = {
      ...this.movies[movieIndex],
      ...updatedMovieDto,
    };

    return this.movies[movieIndex];
  }

  delete(id: number): boolean {
    const movieIndex = this.movies.findIndex((movie) => movie.id === id);

    if (movieIndex < 0) {
      return false;
    }

    this.movies.splice(movieIndex, 1);

    return true;
  }
}
