import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import dotenv from 'dotenv';
dotenv.config();
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  exports: [JwtModule],
})
export class SharedJwtModule {}
