import type { Page } from '@playwright/test';

/** Waits until React has attached to the page: a click before that does nothing. */
export async function hydrated(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const node = document.querySelector('#cart-count, #content, form');
      return Boolean(node && Object.keys(node).some((k) => k.startsWith('__react')));
    },
    undefined,
    { timeout: 60_000 },
  );
}
