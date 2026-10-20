import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

// Originaler skaleres ned til højst denne bredde/højde ved upload
const MAKS_STOERRELSE = 2400;
const KVALITET = 80;
const FORMATER = ['jpeg', 'png', 'webp', 'tiff', 'avif'] as const;
type Format = (typeof FORMATER)[number];

interface UploadFil {
  hash: string;
  filepath?: string;
  tmpWorkingDirectory?: string;
  getStream: () => fs.ReadStream;
  [noegle: string]: unknown;
}

/**
 * Erstatter Strapis optimize, som kører på originalen ved hver upload:
 * - drejer billedet efter EXIF-orienteringen
 * - skalerer ned til MAKS_STOERRELSE (aldrig op)
 * - genkoder, så EXIF/GPS og andre metadata fjernes (sharp beholder dem ikke)
 * Resultatet bruges altid, også hvis filen bliver større, så metadata aldrig gemmes.
 */
async function optimize(fil: UploadFil, original: (f: UploadFil) => Promise<UploadFil>) {
  if (!fil.filepath) return original(fil);

  const { format } = await sharp(fil.filepath).metadata();
  if (!format || !FORMATER.includes(format as Format)) return original(fil);

  const ud = path.join(fil.tmpWorkingDirectory ?? path.dirname(fil.filepath), `optimized-${fil.hash}`);
  const billede = sharp(fil.filepath)
    .rotate()
    .resize({ width: MAKS_STOERRELSE, height: MAKS_STOERRELSE, fit: 'inside', withoutEnlargement: true });

  if (format === 'png') billede.png({ compressionLevel: 9 });
  else billede[format as Exclude<Format, 'png'>]({ quality: KVALITET });

  const info = await billede.toFile(ud);

  return {
    ...fil,
    filepath: ud,
    getStream: () => fs.createReadStream(ud),
    width: info.width,
    height: info.height,
    size: info.size / 1000,
    sizeInBytes: info.size,
  };
}

export default (plugin: { services: Record<string, unknown> }) => {
  const service = plugin.services['image-manipulation'];

  const udvid = (s: Record<string, unknown>) => {
    const original = s.optimize as (f: UploadFil) => Promise<UploadFil>;
    return { ...s, optimize: (fil: UploadFil) => optimize(fil, original) };
  };

  plugin.services['image-manipulation'] =
    typeof service === 'function'
      ? (...args: unknown[]) => udvid((service as (...a: unknown[]) => Record<string, unknown>)(...args))
      : udvid(service as Record<string, unknown>);

  return plugin;
};
