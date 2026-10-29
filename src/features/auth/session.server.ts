import { getRequestHeaders } from '@tanstack/react-start/server';
import { can, type Area } from './domain/roles';
import { auth } from './auth.server';

export interface Viewer {
  id: string;
  name: string;
  email: string;
  role: string;
}

/** The signed-in person of this request, or null. */
export async function viewerOf(): Promise<Viewer | null> {
  const result = await (await auth()).api.getSession({ headers: getRequestHeaders() });
  if (!result) return null;
  const u = result.user as typeof result.user & { role?: string };
  return { id: u.id, name: u.name, email: u.email, role: u.role ?? 'customer' };
}

export class AccessError extends Error {}

export async function requireViewer(): Promise<Viewer> {
  const viewer = await viewerOf();
  if (!viewer) throw new AccessError('signed-out');
  return viewer;
}

export async function requireArea(area: Area): Promise<Viewer> {
  const viewer = await requireViewer();
  if (!can(viewer.role, area)) throw new AccessError('forbidden');
  return viewer;
}
