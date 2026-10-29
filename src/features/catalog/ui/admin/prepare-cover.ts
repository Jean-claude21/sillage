/**
 * Prepares a picture chosen by the team for the shop: at most 900 px high (twice the size the
 * covers are shown at), re-encoded in WebP. A photo of several megabytes becomes ~100 KB.
 */
const MAX_HEIGHT = 900;
const MAX_WIDTH = 700;
export const MAX_SOURCE_BYTES = 15 * 1024 * 1024;

export async function prepareCover(file: File): Promise<{ contentType: 'image/webp' | 'image/jpeg'; base64: string; preview: string }> {
  if (!/^image\/(jpeg|png|webp|avif|heic|heif|gif)$/.test(file.type) || file.size > MAX_SOURCE_BYTES) throw new Error('invalid');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_HEIGHT / bitmap.height, MAX_WIDTH / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('invalid');
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  let blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.86));
  // A browser without WebP encoding answers with PNG: JPEG is then the lighter choice.
  if (!blob || blob.type !== 'image/webp') blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88));
  if (!blob) throw new Error('invalid');
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return { contentType: blob.type as 'image/webp' | 'image/jpeg', base64: btoa(binary), preview: canvas.toDataURL(blob.type) };
}
