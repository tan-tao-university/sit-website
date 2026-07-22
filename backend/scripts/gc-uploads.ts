import 'dotenv/config';
import { readdir, stat, unlink } from 'fs/promises';
import { join, relative } from 'path';
import { pool } from '../db';
import { UPLOADS_DIR } from '../src/upload/upload.service';
import { parseManagedUploadPath } from '../src/upload/upload-path.util';
import { findReferencedUploadPaths } from '../src/upload/upload-reference.repository';

const apply = process.argv.includes('--apply');
const ageArgument = process.argv.find((value) =>
  value.startsWith('--min-age-hours='),
);
const minAgeHours = Number(ageArgument?.split('=')[1] ?? 24);
if (!Number.isFinite(minAgeHours) || minAgeHours < 1) {
  throw new Error(
    '--min-age-hours must be a number greater than or equal to 1',
  );
}

const publicUrl = process.env.UPLOAD_PUBLIC_URL || 'http://localhost:8080';
const trustedOrigins = new Set(
  [publicUrl, ...(process.env.UPLOAD_TRUSTED_ORIGINS || '').split(',')]
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => new URL(value).origin),
);
const resolvePath = (value: string) =>
  parseManagedUploadPath(value, trustedOrigins);

async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(path)));
    else files.push(path);
  }
  return files;
}

async function main() {
  const referencedPaths = await findReferencedUploadPaths(resolvePath);
  const files = await listFiles(UPLOADS_DIR).catch(
    (error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return [];
      throw error;
    },
  );
  const cutoff = Date.now() - minAgeHours * 60 * 60 * 1000;
  const candidates: string[] = [];

  for (const file of files) {
    const uploadPath = relative(UPLOADS_DIR, file).split('\\').join('/');
    if (referencedPaths.has(uploadPath)) continue;
    if ((await stat(file)).mtimeMs > cutoff) continue;
    candidates.push(uploadPath);
  }

  for (const uploadPath of candidates) {
    console.log(`${apply ? 'DELETE' : 'WOULD_DELETE'} ${uploadPath}`);
    if (apply) await unlink(join(UPLOADS_DIR, uploadPath));
  }

  console.log(
    JSON.stringify({
      mode: apply ? 'apply' : 'dry-run',
      scanned: files.length,
      referenced: referencedPaths.size,
      candidates: candidates.length,
      minAgeHours,
    }),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
