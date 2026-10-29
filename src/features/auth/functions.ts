import { createServerFn } from '@tanstack/react-start';
import { viewerOf } from './session.server';

/** The signed-in person, read by the layouts before drawing. */
export const fetchViewer = createServerFn({ method: 'GET' }).handler(() => viewerOf());
