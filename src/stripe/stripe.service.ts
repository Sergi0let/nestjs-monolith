import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  constructor(@Inject('STRIPE_CLIENT') private readonly stripe: Stripe) {}

  // платіжний намір
  async createPaymentIntent(amount: number, currency: string) {
    if (amount <= 0)
      throw new BadRequestException('Amount must be greater then zero');

    return this.stripe.paymentIntents.create({
      amount,
      currency,
    });
  }

  // отримуємо платіжний намір
  async retrievePaymentIntent(paymentIntentId: string) {
    if (!paymentIntentId)
      throw new BadRequestException('paymentIntentId is required');

    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }
}
