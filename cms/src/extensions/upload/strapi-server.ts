import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

// Originals are scaled down to at most this width/height on upload
const MAX_SIZE = 2400;
const QUALITY = 80;
const FORMATS = ['jpeg', 'png', 'webp', 'tiff', 'avif'] as const;
type Format = (typeof FORMATS)[number];

interface UploadFile {
  hash: string;
  filepath?: string;
  tmpWorkingDirectory?: string;
  getStream: () => fs.ReadStream;
  [key: string]: unknown;
}

/**
 * Replaces Strapi's optimize, which runs on the original on every upload:
 * - rotates the image according to its EXIF orientation
 * - scales down to MAX_SIZE (never up)
 * - re-encodes so EXIF/GPS and other metadata are removed (sharp does not keep them)
 * The result is always used, even if the file gets larger, so metadata is never stored.
 */
async function optimize(file: UploadFile, original: (f: UploadFile) => Promise<UploadFile>) {
  if (!file.filepath) return original(file);

  const { format } = await sharp(file.filepath).metadata();
  if (!format || !FORMATS.includes(format as Format)) return original(file);

  const output = path.join(file.tmpWorkingDirectory ?? path.dirname(file.filepath), `optimized-${file.hash}`);
  const image = sharp(file.filepath)
    .rotate()
    .resize({ width: MAX_SIZE, height: MAX_SIZE, fit: 'inside', withoutEnlargement: true });

  if (format === 'png') image.png({ compressionLevel: 9 });
  else image[format as Exclude<Format, 'png'>]({ quality: QUALITY });

  const info = await image.toFile(output);

  return {
    ...file,
    filepath: output,
    getStream: () => fs.createReadStream(output),
    width: info.width,
    height: info.height,
    size: info.size / 1000,
    sizeInBytes: info.size,
  };
}

export default (plugin: { services: Record<string, unknown> }) => {
  const service = plugin.services['image-manipulation'];

  const extend = (s: Record<string, unknown>) => {
    const original = s.optimize as (f: UploadFile) => Promise<UploadFile>;
    return { ...s, optimize: (file: UploadFile) => optimize(file, original) };
  };

  plugin.services['image-manipulation'] =
    typeof service === 'function'
      ? (...args: unknown[]) => extend((service as (...a: unknown[]) => Record<string, unknown>)(...args))
      : extend(service as Record<string, unknown>);

  return plugin;
};
