import { eq } from 'drizzle-orm';
import type { Db } from '@/platform/db';
import { SETTINGS, type SettingsKey, type SettingsValues } from '../domain/settings';
import { settings } from './settings.table';

/** A group of settings, its stored value checked against the domain, or its defaults. */
export async function readSettings<K extends SettingsKey>(db: Db, key: K): Promise<SettingsValues[K]> {
  const [row] = await db.select().from(settings).where(eq(settings.key, key));
  const parsed = SETTINGS[key].schema.safeParse(row?.value);
  return (parsed.success ? parsed.data : SETTINGS[key].defaults) as SettingsValues[K];
}

export async function readAllSettings(db: Db): Promise<SettingsValues> {
  const rows = await db.select().from(settings);
  const pick = <K extends SettingsKey>(key: K): SettingsValues[K] => {
    const parsed = SETTINGS[key].schema.safeParse(rows.find((r) => r.key === key)?.value);
    return (parsed.success ? parsed.data : SETTINGS[key].defaults) as SettingsValues[K];
  };
  return { shop: pick('shop'), delivery: pick('delivery'), payments: pick('payments'), content: pick('content') };
}

export async function writeSettings<K extends SettingsKey>(db: Db, key: K, value: SettingsValues[K]): Promise<void> {
  const checked = SETTINGS[key].schema.parse(value);
  await db
    .insert(settings)
    .values({ key, value: checked })
    .onConflictDoUpdate({ target: settings.key, set: { value: checked, updatedAt: new Date() } });
}
