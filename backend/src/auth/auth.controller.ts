import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { AuthenticatedGuard } from './guards/authenticated.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() loginDto: LoginDto, @Req() req: any) {
    return this.authService.login(req.user);
  }

  @Post('logout')
  @UseGuards(AuthenticatedGuard)
  async logout(@Req() req: any) {
    req.logout((err) => {
      if (err) {
        throw err;
      }
    });
    return { message: 'Logged out successfully' };
  }
}
