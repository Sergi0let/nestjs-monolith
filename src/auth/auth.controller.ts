import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorator/current-user.decorastor';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(@Req() req: any) {
    return this.authService.login(req.user);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  profile(@CurrentUser() user: any) {
    return user;
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async google() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: any) {
    return this.authService.googleAuth(req.user?._json.email as string);
  }
}
