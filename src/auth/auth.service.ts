import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    const comparePassword =
      user && user.password
        ? await bcrypt.compare(password, user.password)
        : null;

    if (user && comparePassword) return user;

    throw new UnauthorizedException('Wrong credentials');
  }
}
