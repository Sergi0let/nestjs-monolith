import { Inject, Injectable } from '@nestjs/common';

import Redis from 'ioredis';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    //1. Inject Redis чому так?
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  async create(dto: CreateOrderDto) {
    const { userId, orderProduct } = dto;
    // 8. видаляємо кеш у Redis перед створенням нового замовлення
    await this.redisClient.del('orders_all');

    return this.prisma.order.create({
      data: {
        User: {
          connect: {
            id: userId,
          },
        },
        orderProduct: {
          create: orderProduct.map((product) => ({
            productId: product.productId,
          })),
        },
      },
    });
  }
  // 2. кешуємо цей запит для збільшення швидкості через Redis
  async findAll() {
    // 3. вказуємо ключ який буде використовуватися для кешування
    const cacheKey = 'orders_all';
    // 4. перевіряємо чи є кеш у Redis через запит
    const cachedOrders = await this.redisClient.get(cacheKey);

    // 5. якщо є то повертаємо з кешу дані
    if (cachedOrders) {
      return JSON.parse(cachedOrders);
    }

    // 6. якщо немає то виконуємо запит до бази даних
    const orders = await this.prisma.order.findMany({
      include: {
        orderProduct: {
          include: {
            Product: true,
          },
        },
        User: true,
      },
    });

    // 7. результат запиту зберігаємо у redis - кешключіндентифікатор + час у секундах + сереалізуємо результат запуту
    await this.redisClient.setex(cacheKey, 3600, JSON.stringify(orders));
    return orders;
  }
  async findOne(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        orderProduct: {
          include: {
            Product: true,
          },
        },
        User: true,
      },
    });
  }
  async update(id: number, dto: UpdateOrderDto) {
    const { orderProduct = [], userId } = dto;

    return this.prisma.order.update({
      where: { id },
      data: {
        User: {
          connect: {
            id: userId,
          },
        },
        orderProduct: {
          deleteMany: {},
          create: orderProduct.map((product) => ({
            productId: product.productId,
          })),
        },
      },
    });
  }
  async remove(id: number) {
    return this.prisma.order.delete({ where: { id } });
  }
}
