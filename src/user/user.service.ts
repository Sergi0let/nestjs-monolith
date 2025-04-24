import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { BaseResourceService } from 'src/common/base-resource/base-resource.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService extends BaseResourceService {
  constructor(prisma: PrismaService) {
    super(prisma, 'user');
  }

  async create(dto: CreateUserDto) {
    const { email, password } = dto;
    const existingUser = await this.findByEmail(email);

    if (existingUser) throw new BadRequestException('User already exist');

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
