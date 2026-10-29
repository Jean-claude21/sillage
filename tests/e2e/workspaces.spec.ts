import { expect, test, type Page } from '@playwright/test';
import { hydrated } from './hydrated';
import { readFileSync } from 'node:fs';

// The two workspaces, signed in with the accounts the local seed creates from .env.
const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);

async function signIn(page: Page, email: string, password: string) {
  await page.goto('/connexion', { waitUntil: 'load' });
  await hydrated(page);
  await page.locator('[name=email]').first().fill(email);
  await page.locator('[name=password]').fill(password);
  await page.getByRole('button', { name: 'Me connecter' }).click();
  await page.waitForURL(/\/(admin|mon-compte)$/);
}

const shot = (page: Page, name: string) => page.screenshot({ path: `review/${name}.png`, fullPage: true });

test('the team manages orders, stock and settings', async ({ page }) => {
  await signIn(page, env['ADMIN_EMAIL']!, env['ADMIN_PASSWORD']!);
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('La librairie, en un coup d’œil.');
  await shot(page, 'app-admin-overview');

  await page.goto('/admin/commandes/SL-1048', { waitUntil: 'networkidle' });
  await shot(page, 'app-admin-order');
  await page.locator('select[name=delivery]').selectOption('preparation');
  await page.getByRole('button', { name: 'Mettre à jour' }).click();
  await expect(page.getByText('Le suivi de la commande a été mis à jour.')).toBeVisible();

  for (const [path, name] of [
    ['/admin/commandes', 'app-admin-orders'],
    ['/admin/catalogue', 'app-admin-catalog'],
    ['/admin/stocks', 'app-admin-stocks'],
    ['/admin/catalogue/maison-des-marees', 'app-admin-book'],
    ['/admin/clients', 'app-admin-customers'],
    ['/admin/editeurs', 'app-admin-publishers'],
    ['/admin/livraisons', 'app-admin-deliveries'],
    ['/admin/paiements', 'app-admin-payments'],
    ['/admin/contenus', 'app-admin-content'],
    ['/admin/parametres?onglet=livraison', 'app-admin-settings'],
  ] as const) {
    await page.goto(path, { waitUntil: 'networkidle' });
    await expect(page.locator('.page-heading h1')).toBeVisible();
    await shot(page, name);
  }
});

test('the team chooses a cover image and the shop shows it', async ({ page, request }) => {
  await signIn(page, env['ADMIN_EMAIL']!, env['ADMIN_PASSWORD']!);
  await page.goto('/admin/catalogue/carnet-creatif', { waitUntil: 'load' });
  await hydrated(page);
  // A real picture, drawn by the browser: 600 × 880, a portrait cover.
  const png = await page.evaluate(async () => {
    const c = document.createElement('canvas');
    c.width = 600;
    c.height = 880;
    const g = c.getContext('2d')!;
    g.fillStyle = '#194e3d';
    g.fillRect(0, 0, 600, 880);
    g.fillStyle = '#f4cd65';
    g.beginPath();
    g.arc(300, 520, 160, 0, Math.PI * 2);
    g.fill();
    return c.toDataURL('image/png').split(',')[1]!;
  });
  await page.locator('#cover-file').setInputFiles({ name: 'couverture.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') });
  await expect(page.getByText('Image ajoutée.', { exact: false })).toBeVisible();
  await shot(page, 'app-admin-cover');
  await page.getByRole('button', { name: 'Enregistrer le livre' }).click();
  await expect(page).toHaveURL(/\/admin\/catalogue$/);

  await page.goto('/livres/carnet-creatif', { waitUntil: 'load' });
  const src = await page.locator('.product-art img').getAttribute('src');
  expect(src).toMatch(/^\/images\/couvertures\/[0-9a-f-]{36}\.(webp|jpg)$/);
  const image = await request.get(src!);
  expect(image.status()).toBe(200);
  expect(image.headers()['content-type']).toMatch(/^image\/(webp|jpeg)$/);
});

test('a reader follows orders and manages the account', async ({ page }) => {
  await signIn(page, 'afi.mensah@example.com', env['DEMO_CUSTOMER_PASSWORD']!);
  await expect(page).toHaveURL(/\/mon-compte$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bonjour Afi,');
  await shot(page, 'app-client-overview');
  for (const [path, name] of [
    ['/mon-compte/commandes', 'app-client-orders'],
    ['/mon-compte/commandes/SL-1048', 'app-client-order'],
    ['/mon-compte/favoris', 'app-client-wishes'],
    ['/mon-compte/adresses', 'app-client-addresses'],
    ['/mon-compte/profil', 'app-client-profile'],
    ['/mon-compte/aide', 'app-client-support'],
  ] as const) {
    await page.goto(path, { waitUntil: 'networkidle' });
    await expect(page.locator('.page-heading h1')).toBeVisible();
    await shot(page, name);
  }
  // A reader never opens the team's space.
  await page.goto('/admin', { waitUntil: 'networkidle' });
  await expect(page).toHaveURL(/\/mon-compte$/);
});

test('a visitor is asked to sign in before the workspaces', async ({ page }) => {
  await page.goto('/admin', { waitUntil: 'networkidle' });
  await expect(page).toHaveURL(/\/connexion\?redirect=/);
});
