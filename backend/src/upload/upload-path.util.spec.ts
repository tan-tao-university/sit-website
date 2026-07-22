import {
  collectManagedUploadPaths,
  parseManagedUploadPath,
} from './upload-path.util';

const origins = new Set(['http://localhost:8080', 'https://api.example.com']);
const resolvePath = (value: string) => parseManagedUploadPath(value, origins);

describe('managed upload paths', () => {
  it('accepts configured origins and relative upload URLs', () => {
    expect(
      resolvePath('https://api.example.com/uploads/news/a%20b.png?width=100'),
    ).toBe('news/a b.png');
    expect(resolvePath('/uploads/editor/image.png')).toBe('editor/image.png');
  });

  it('rejects lookalike origins and traversal', () => {
    expect(resolvePath('https://evil.example/uploads/news/a.png')).toBeNull();
    expect(
      resolvePath('https://api.example.com/uploads/../secret.txt'),
    ).toBeNull();
    expect(
      resolvePath('https://api.example.com/uploads/%2e%2e/secret.txt'),
    ).toBeNull();
  });

  it('collects unique upload paths from nested rich content', () => {
    const paths = collectManagedUploadPaths(
      {
        cover: 'http://localhost:8080/uploads/news/cover.jpg',
        blocks: [
          { src: 'https://api.example.com/uploads/editor/one.png' },
          { src: 'https://api.example.com/uploads/editor/one.png' },
          { src: 'https://cdn.example.com/external.png' },
        ],
      },
      resolvePath,
    );

    expect([...paths].sort()).toEqual(['editor/one.png', 'news/cover.jpg']);
  });
});
