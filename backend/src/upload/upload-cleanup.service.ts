import { Injectable, Logger } from '@nestjs/common';
import { UploadService } from './upload.service';
import { collectManagedUploadPaths } from './upload-path.util';
import { findReferencedUploadPaths } from './upload-reference.repository';

@Injectable()
export class UploadCleanupService {
  private readonly logger = new Logger(UploadCleanupService.name);

  constructor(private readonly uploadService: UploadService) {}

  async cleanupReplaced(previous: unknown, current: unknown): Promise<void> {
    const previousPaths = collectManagedUploadPaths(
      previous,
      this.uploadService.getManagedPath,
    );
    const currentPaths = collectManagedUploadPaths(
      current,
      this.uploadService.getManagedPath,
    );
    const removedPaths = [...previousPaths].filter(
      (path) => !currentPaths.has(path),
    );
    await this.cleanupPaths(removedPaths);
  }

  async cleanupDeleted(deleted: unknown): Promise<void> {
    const paths = collectManagedUploadPaths(
      deleted,
      this.uploadService.getManagedPath,
    );
    await this.cleanupPaths(paths);
  }

  async deleteIfUnreferenced(fileUrl: string): Promise<boolean> {
    const path = this.uploadService.getManagedPath(fileUrl);
    if (!path) return false;
    return this.cleanupPath(path);
  }

  private async cleanupPaths(paths: Iterable<string>): Promise<void> {
    const candidates = [...new Set(paths)];
    if (candidates.length === 0) return;

    let referencedPaths: Set<string>;
    try {
      referencedPaths = await findReferencedUploadPaths(
        this.uploadService.getManagedPath,
      );
    } catch (error) {
      this.logger.error(
        'Skipped upload cleanup because references could not be loaded',
        error instanceof Error ? error.stack : String(error),
      );
      return;
    }

    for (const path of candidates) {
      if (!referencedPaths.has(path)) await this.removePath(path);
    }
  }

  private async cleanupPath(path: string): Promise<boolean> {
    try {
      const referencedPaths = await findReferencedUploadPaths(
        this.uploadService.getManagedPath,
      );
      if (referencedPaths.has(path)) return false;
      return await this.uploadService.deleteManagedPath(path);
    } catch (error) {
      this.logger.error(
        `Failed to clean upload ${path}`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }

  private async removePath(path: string): Promise<void> {
    try {
      await this.uploadService.deleteManagedPath(path);
    } catch (error) {
      this.logger.error(
        `Failed to clean upload ${path}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
