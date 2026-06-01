import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception.code === 'P2025') {
      const notFoundException = new NotFoundException('Record not found');
      const status = notFoundException.getStatus();

      return response.status(status).json({
        statusCode: status,
        message: 'Record not found',
        error: 'Not Found',
      });
    }

    if (exception.code === 'P2003') {
      return response.status(400).json({
        statusCode: 400,
        message: 'Related record does not exist',
        error: 'Bad Request',
      });
    }

    throw exception;
  }
}
