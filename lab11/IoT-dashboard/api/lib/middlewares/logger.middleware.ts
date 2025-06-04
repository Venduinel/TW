import { Request, Response, NextFunction } from 'express';

const loggerMiddleware = (request: Request, response: Response, next: NextFunction): void => {
  console.log(`[MY LOGGER] ${request.method} ${request.url} at ${new Date().toISOString()}`);
  next();
};

export default loggerMiddleware;