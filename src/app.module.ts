import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MoviesModule } from './movies/movies.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [MoviesModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
