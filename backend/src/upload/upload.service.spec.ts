import { readFile, rm } from 'fs/promises';
import { join } from 'path';
import { UploadService, UPLOADS_DIR } from './upload.service';

const svc = new UploadService({
  get: () => 'http://localhost:8080',
} as any);

const fakeFile = (name: string) =>
  ({
    originalname: name,
    buffer: Buffer.from('hi'),
    mimetype: 'image/png',
  }) as Express.Multer.File;

describe('UploadService (local storage)', () => {
  afterAll(async () => {
    await rm(join(UPLOADS_DIR, 'test'), { recursive: true, force: true });
    await rm(join(UPLOADS_DIR, '__evil'), { recursive: true, force: true });
  });

  it('writes file and returns absolute /uploads URL', async () => {
    const url = await svc.uploadFile(fakeFile('pic.png'), 'test');
    expect(url).toMatch(
      /^http:\/\/localhost:8080\/uploads\/test\/\d+-pic\.png$/,
    );
    const rel = url.split('/uploads/')[1];
    expect((await readFile(join(UPLOADS_DIR, rel))).toString()).toBe('hi');
  });

  it('sanitizes path traversal in filename and folder', async () => {
    const url = await svc.uploadFile(fakeFile('../../etc/passwd'), '../evil');
    // No ".." survives, and the resolved path stays inside UPLOADS_DIR
    expect(url).not.toContain('..');
    const resolved = join(UPLOADS_DIR, url.split('/uploads/')[1]);
    expect(resolved.startsWith(UPLOADS_DIR)).toBe(true);
  });

  it('deleteFile ignores non-local URLs', async () => {
    await expect(
      svc.deleteFile('https://cdn.example.com/uploads/test/pic.png'),
    ).resolves.toBe(false);
  });

  it('deleteFile refuses to unlink outside UPLOADS_DIR', async () => {
    // Would resolve to a parent dir; guard must reject without throwing.
    await expect(
      svc.deleteFile('http://x/uploads/../../../../etc/hosts'),
    ).resolves.toBe(false);
  });

  it('deletes a managed file', async () => {
    const url = await svc.uploadFile(fakeFile('delete-me.png'), 'test');
    const rel = url.split('/uploads/')[1];

    await expect(svc.deleteFile(url)).resolves.toBe(true);
    await expect(readFile(join(UPLOADS_DIR, rel))).rejects.toMatchObject({
      code: 'ENOENT',
    });
  });
});
