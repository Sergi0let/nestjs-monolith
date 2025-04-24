import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BaseResourceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly model: string,
  ) {}

  async create(dto: any) {
    return await this.prisma[this.model].create({ data: dto });
  }

  async findAll() {
    return await this.prisma[this.model].findMany();
  }

  async findOne(id: number) {
    return await this.prisma[this.model].findUnique({ where: { id } });
  }

  async update(id: number, dto: any) {
    return await this.prisma[this.model].update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    return await this.prisma[this.model].delete({ where: { id } });
  }
}
