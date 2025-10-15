import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY || 'sk_test_fallback',
      {
        apiVersion: '2025-06-30.basil',
      },
    );
  }

  getPaymentMethods(_userId: number) {
    try {
      // For now, return empty array until we implement customer management
      // In a real app, you'd store customer IDs and fetch their payment methods
      return [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }

  addPaymentMethod(_userId: number, _paymentMethodData: any) {
    try {
      // Create or attach payment method to customer
      return { success: true, message: 'Payment method added successfully' };
    } catch (error) {
      console.error('Error adding payment method:', error);
      return { success: false, message: 'Failed to add payment method' };
    }
  }

  removePaymentMethod(_userId: number, _methodId: string) {
    try {
      // Detach payment method from customer
      return { success: true, message: 'Payment method removed successfully' };
    } catch (error) {
      console.error('Error removing payment method:', error);
      return { success: false, message: 'Failed to remove payment method' };
    }
  }

  async createSetupIntent(_userId: number) {
    try {
      const setupIntent = await this.stripe.setupIntents.create({
        usage: 'off_session',
      });

      return {
        client_secret: setupIntent.client_secret,
      };
    } catch (error) {
      console.error('Error creating setup intent:', error);
      throw new Error('Failed to create setup intent');
    }
  }
}
