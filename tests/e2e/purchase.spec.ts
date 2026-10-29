import { expect, test } from '@playwright/test';

// The whole purchase, as a reader does it: a book in the cart, the checkout, the test payment,
// the confirmation. Runs against the local server (pnpm dev) with the demo catalogue.
test('a reader buys a book and pays with Mobile Money', async ({ page }) => {
  await page.goto('/livres/minuit-sur-le-fleuve', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Augmenter la quantité' }).click();
  await page.getByRole('button', { name: 'Ajouter au panier', exact: true }).click();
  await expect(page.locator('#cart-count')).toHaveText('2');

  await page.getByRole('button', { name: 'Ouvrir mon panier' }).click();
  await page.getByRole('button', { name: /Voir le récapitulatif/ }).click();
  await expect(page).toHaveURL(/\/commande$/);
  await page.screenshot({ path: 'review/app-checkout.png', fullPage: true });

  await page.locator('[name=name]').fill('Lecteur Test');
  await page.locator('input[name=email]').fill('lecteur.test@example.com');
  await page.locator('[name=phone]').fill('90 11 22 33');
  await page.locator('[name=street]').fill('5, rue des Essais');
  await page.locator('[name=area]').fill('Tokoin');
  await page.getByRole('radio', { name: /^Mobile Money/ }).check();
  await page.getByRole('button', { name: /Commander et payer/ }).click();

  await expect(page).toHaveURL(/\/paiement\/SL-\d+/);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'review/app-payment.png', fullPage: true });
  await page.getByRole('button', { name: /Confirmer le paiement/ }).click();

  await expect(page).toHaveURL(/\/commande\/SL-\d+\?t=/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Merci, vos livres se préparent.');
  await expect(page.getByText('Mobile Money · Payé')).toBeVisible();
  await expect(page.locator('#cart-count')).toHaveText('0');
  await page.screenshot({ path: 'review/app-confirmation.png', fullPage: true });
});

test('an order paid on delivery skips the payment page', async ({ page }) => {
  await page.goto('/livres/carnet-creatif', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Ajouter au panier', exact: true }).click();
  await page.goto('/commande', { waitUntil: 'networkidle' });
  await page.locator('[name=name]').fill('Lectrice Test');
  await page.locator('input[name=email]').fill('lectrice.test@example.com');
  await page.locator('[name=phone]').fill('90 44 55 66');
  await page.locator('[name=street]').fill('Quartier des Essais');
  await page.getByRole('radio', { name: /^Hors Grand Lomé/ }).check();
  await page.locator('[name=area]').fill('Centre');
  await page.locator('[name=city]').fill('Kpalimé');
  await page.getByRole('radio', { name: /^Paiement à la livraison/ }).check();
  await page.getByRole('button', { name: /Valider ma commande/ }).click();
  await expect(page).toHaveURL(/\/commande\/SL-\d+\?t=/);
  await expect(page.getByText('Vous réglerez à la livraison.', { exact: false })).toBeVisible();
});
