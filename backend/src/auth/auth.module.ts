import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AdminGuard } from './guards/admin.guard';
import { ManagerGuard } from './guards/manager.guard';
import { ClientGuard } from './guards/client.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-jwt-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
    UsersModule,
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    AdminGuard,
    ManagerGuard,
    ClientGuard,
    LocalAuthGuard,
    JwtAuthGuard,
  ],
  controllers: [AuthController],
  exports: [
    AuthService,
    JwtModule,
    AdminGuard,
    ManagerGuard,
    ClientGuard,
    JwtAuthGuard,
  ],
})
export class AuthModule {}