import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ValidateTokenMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.sendStatus(401);
    }

    const token = authHeader.split(' ')[1].trim();
    console.log(token);
    try {
      const verified = await this.jwtService.verifyAsync(token);
      req['user'] = verified;
      next();
    } catch (err) {
      return res.sendStatus(401);
    }
  }
}
