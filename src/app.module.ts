import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { BrandModule } from './brand/brand.module';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
      },
    }),
    PrismaModule,
    UserModule,
    BrandModule,
    OrderModule,
    ProductModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
