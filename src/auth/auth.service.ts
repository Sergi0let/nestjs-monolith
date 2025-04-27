import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IUser } from 'src/common/types/types';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    const comparePassword =
      user && user.password
        ? await bcrypt.compare(password, user.password)
        : null;

    if (user && comparePassword) return user;

    throw new UnauthorizedException('Wrong credentials');
  }

  async register(user: CreateUserDto) {
    const { email, password } = user;

    return this.userService.create({ email, password });
  }

  login(user: IUser) {
    const { id, email } = user;

    return {
      id,
      email,
      token: this.jwtService.sign({ id, email }),
    };
  }

  async googleAuth(email: string) {
    const user = await this.userService.findByEmail(email);

    if (user) {
      return this.jwtService.sign({ id: user.id, email: user.email });
    }

    return this.userService.create({ email });
  }
}
