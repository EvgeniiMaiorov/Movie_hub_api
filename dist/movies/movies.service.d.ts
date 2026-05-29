import { Movie } from './interfaces/movie.interface';
export declare class MoviesService {
    private movies;
    findAll(): Movie[];
    findById(id: number): Movie | null;
    create(movie: Omit<Movie, 'id'>): Movie;
    update(id: number, updatedMovie: Partial<Omit<Movie, 'id'>>): Movie | null;
    delete(id: number): boolean;
}
