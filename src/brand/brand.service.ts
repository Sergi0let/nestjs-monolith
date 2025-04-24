import { Injectable } from '@nestjs/common';
import { BaseResourceService } from 'src/common/base-resource/base-resource.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BrandService extends BaseResourceService {
  constructor(prisma: PrismaService) {
    super(prisma, 'brand');
  }
}
