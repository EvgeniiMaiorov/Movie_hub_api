import { MoviesService } from './movies.service';
import { Movie } from './interfaces/movie.interface';
export declare class MoviesController {
    private readonly moviesService;
    constructor(moviesService: MoviesService);
    findAll(): Movie[];
    create(movie: Omit<Movie, 'id'>): Movie;
}
