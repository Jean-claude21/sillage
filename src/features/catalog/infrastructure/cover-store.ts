import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { env } from '@/platform/env';

/**
 * Where uploaded covers live: the private bucket of the database's Neon branch (S3-compatible),
 * or a folder of .data/ in local development when no storage key is given. Each upload has its own
 * key: files are never overwritten.
 */
export interface StoredCover {
  bytes: Uint8Array;
  contentType: string;
}

const LOCAL_DIR = join('.data', 'covers');
let client: S3Client | null = null;

function s3(): S3Client | null {
  if (!env.storage.endpoint || !env.storage.accessKeyId || !env.storage.secretAccessKey) return null;
  client ??= new S3Client({
    endpoint: env.storage.endpoint,
    region: env.storage.region,
    forcePathStyle: true,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    credentials: { accessKeyId: env.storage.accessKeyId, secretAccessKey: env.storage.secretAccessKey },
  });
  return client;
}

export async function saveCover(key: string, bytes: Uint8Array, contentType: string): Promise<void> {
  const remote = s3();
  if (remote) {
    await remote.send(new PutObjectCommand({ Bucket: env.storage.bucket, Key: key, Body: bytes, ContentType: contentType }));
    return;
  }
  await mkdir(LOCAL_DIR, { recursive: true });
  await writeFile(join(LOCAL_DIR, key), bytes);
  await writeFile(join(LOCAL_DIR, `${key}.type`), contentType);
}

export async function readCover(key: string): Promise<StoredCover | null> {
  const remote = s3();
  if (remote) {
    try {
      const object = await remote.send(new GetObjectCommand({ Bucket: env.storage.bucket, Key: key }));
      if (!object.Body) return null;
      return { bytes: await object.Body.transformToByteArray(), contentType: object.ContentType ?? 'image/webp' };
    } catch (error) {
      if ((error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 404) return null;
      throw error;
    }
  }
  try {
    const bytes = new Uint8Array(await readFile(join(LOCAL_DIR, key)));
    const contentType = await readFile(join(LOCAL_DIR, `${key}.type`), 'utf8').catch(() => 'image/webp');
    return { bytes, contentType };
  } catch {
    return null;
  }
}
