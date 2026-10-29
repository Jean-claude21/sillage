import { env } from '@/platform/env';
import type { PaymentProvider } from './domain/port';
import { fedapayProvider } from './providers/fedapay';
import { simulatedProvider } from './providers/simulated';

/** The provider of this deployment; switching to the real one is an environment variable. */
export function paymentProvider(): PaymentProvider {
  if (env.paymentProvider === 'fedapay' && env.fedapaySecretKey) {
    return fedapayProvider({ secretKey: env.fedapaySecretKey, environment: env.fedapayEnvironment });
  }
  return simulatedProvider();
}

export type { PaymentProvider } from './domain/port';
