import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, writeFile, unlink } from 'fs/promises';
import { isAbsolute, join, relative, resolve } from 'path';
import { parseManagedUploadPath } from './upload-path.util';

export const UPLOADS_DIR = join(process.cwd(), 'uploads');

@Injectable()
export class UploadService {
  private readonly publicUrl: string;
  private readonly trustedOrigins: ReadonlySet<string>;

  constructor(private configService: ConfigService) {
    // Base URL the backend is reachable at; used to build absolute image URLs.
    this.publicUrl = (
      this.configService.get<string>('UPLOAD_PUBLIC_URL') ||
      'http://localhost:8080'
    ).replace(/\/$/, '');

    const configuredOrigins =
      this.configService.get<string>('UPLOAD_TRUSTED_ORIGINS') || '';
    this.trustedOrigins = new Set(
      [this.publicUrl, ...configuredOrigins.split(',')]
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => new URL(value).origin),
    );
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const timestamp = Date.now();
    // Sanitize: strip path separators / traversal from client-supplied name.
    const clean = (s: string) =>
      s.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.{2,}/g, '_');
    const safeName = clean(file.originalname);
    const safeFolder = clean(folder);
    const relPath = `${safeFolder}/${timestamp}-${safeName}`;

    const dir = join(UPLOADS_DIR, safeFolder);
    await mkdir(dir, { recursive: true });
    await writeFile(join(UPLOADS_DIR, relPath), file.buffer);

    return `${this.publicUrl}/uploads/${relPath}`;
  }

  readonly getManagedPath = (fileUrl: string): string | null =>
    parseManagedUploadPath(fileUrl, this.trustedOrigins);

  async deleteFile(fileUrl: string): Promise<boolean> {
    const relativePath = this.getManagedPath(fileUrl);
    if (!relativePath) return false;
    return this.deleteManagedPath(relativePath);
  }

  async deleteManagedPath(relativePath: string): Promise<boolean> {
    const target = resolve(UPLOADS_DIR, relativePath);
    const pathFromUploads = relative(UPLOADS_DIR, target);
    if (
      !pathFromUploads ||
      pathFromUploads.startsWith('..') ||
      isAbsolute(pathFromUploads)
    ) {
      return false;
    }

    try {
      await unlink(target);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
      throw error;
    }
  }

  validateImageFile(file: Express.Multer.File): void {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(
        'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
      );
    }
  }

  validateFileSize(file: Express.Multer.File, maxSizeMB: number): void {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      throw new Error(`File size exceeds ${maxSizeMB}MB limit.`);
    }
  }
}
