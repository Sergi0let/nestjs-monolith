import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';

@Module({
  imports: [],
  providers: [
    {
      provide: 'STRIPE_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Stripe(configService.get('STRIPE_SECRET_KEY') || '', {
          apiVersion: '2025-04-30.basil',
        });
      },
      inject: [ConfigService],
    },
    StripeService,
  ],
  exports: ['STRIPE_CLIENT'],
  controllers: [StripeController],
})
export class StripeModule {}
