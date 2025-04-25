import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IUser } from 'src/common/types/types';
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

  login(user: IUser) {
    const { id, email } = user;

    return {
      id,
      email,
      token: this.jwtService.sign({ id, email }),
    };
  }
}
