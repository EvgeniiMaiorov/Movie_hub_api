"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoviesService = void 0;
const common_1 = require("@nestjs/common");
let MoviesService = class MoviesService {
    movies = [];
    findAll() {
        return this.movies;
    }
    findById(id) {
        return this.movies.find((movie) => movie.id === id) || null;
    }
    create(movie) {
        const newMovie = {
            id: this.movies.length + 1,
            ...movie,
        };
        this.movies.push(newMovie);
        return newMovie;
    }
    update(id, updatedMovie) {
        const movieIndex = this.movies.findIndex((movie) => movie.id === id);
        if (movieIndex < 0) {
            return null;
        }
        this.movies[movieIndex] = {
            ...this.movies[movieIndex],
            ...updatedMovie,
        };
        return this.movies[movieIndex];
    }
    delete(id) {
        const movieIndex = this.movies.findIndex((movie) => movie.id === id);
        if (movieIndex < 0) {
            return false;
        }
        this.movies.splice(movieIndex, 1);
        return true;
    }
};
exports.MoviesService = MoviesService;
exports.MoviesService = MoviesService = __decorate([
    (0, common_1.Injectable)()
], MoviesService);
//# sourceMappingURL=movies.service.js.map