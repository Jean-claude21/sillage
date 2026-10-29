import { z } from 'zod';

// The bookshop's settings, one group per row. Each group has its defaults, so a fresh database
// already behaves like the validated mockup.

export const shopSettings = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().max(150),
  phone: z.string().trim().max(80),
  city: z.string().trim().min(1).max(100),
});

export const deliverySettings = z.object({
  lome: z.number().int().min(0).max(999_999),
  outside: z.number().int().min(0).max(999_999),
  couriers: z.array(z.string().trim().min(1).max(80)).max(20),
});

export const paymentSettings = z.object({
  mobileMoney: z.boolean(),
  card: z.boolean(),
  cashOnDelivery: z.boolean(),
});

export const contentSettings = z.object({
  /** "\n" breaks the line, *words* are set in the italic display face. */
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(300),
  selection: z.array(z.string()).max(4),
});

export type ShopSettings = z.infer<typeof shopSettings>;
export type DeliverySettings = z.infer<typeof deliverySettings>;
export type PaymentSettings = z.infer<typeof paymentSettings>;
export type ContentSettings = z.infer<typeof contentSettings>;

export const SETTINGS = {
  shop: {
    schema: shopSettings,
    defaults: {
      name: 'Sillage',
      email: 'bonjour@sillage.example',
      phone: '+228 · numéro de démonstration',
      city: 'Lomé, Togo',
    } satisfies ShopSettings,
  },
  delivery: {
    schema: deliverySettings,
    defaults: {
      lome: 1500,
      outside: 2500,
      couriers: ['Kossi · équipe livraison', 'Ama · équipe livraison'],
    } satisfies DeliverySettings,
  },
  payments: {
    schema: paymentSettings,
    defaults: { mobileMoney: true, card: true, cashOnDelivery: true } satisfies PaymentSettings,
  },
  content: {
    schema: contentSettings,
    defaults: {
      title: 'Des livres pour\ntoutes *vos envies.*',
      description: 'Un roman qui emporte. Une idée qui éclaire.\nExplorez tous les univers, trouvez votre prochaine lecture.',
      selection: ['maison-des-marees', 'etoiles-de-naya', 'histoire-du-monde', 'saveurs-maison'],
    } satisfies ContentSettings,
  },
} as const;

export type SettingsKey = keyof typeof SETTINGS;
export interface SettingsValues {
  shop: ShopSettings;
  delivery: DeliverySettings;
  payments: PaymentSettings;
  content: ContentSettings;
}
