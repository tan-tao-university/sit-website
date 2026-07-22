export type ManagedPathResolver = (value: string) => string | null;

export function parseManagedUploadPath(
  value: string,
  trustedOrigins: ReadonlySet<string>,
): string | null {
  if (!value) return null;

  let pathname: string;
  try {
    if (value.startsWith('/uploads/')) {
      pathname = new URL(value, 'http://local.invalid').pathname;
    } else {
      const url = new URL(value);
      if (!trustedOrigins.has(url.origin)) return null;
      pathname = url.pathname;
    }
    pathname = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const marker = '/uploads/';
  if (!pathname.startsWith(marker)) return null;

  const relativePath = pathname.slice(marker.length);
  const segments = relativePath.split('/');
  if (
    !relativePath ||
    relativePath.includes('\\') ||
    segments.some((segment) => !segment || segment === '.' || segment === '..')
  ) {
    return null;
  }

  return relativePath;
}

export function collectManagedUploadPaths(
  value: unknown,
  resolvePath: ManagedPathResolver,
  paths = new Set<string>(),
): Set<string> {
  if (typeof value === 'string') {
    const path = resolvePath(value);
    if (path) paths.add(path);
    return paths;
  }

  if (Array.isArray(value)) {
    for (const item of value)
      collectManagedUploadPaths(item, resolvePath, paths);
    return paths;
  }

  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) {
      collectManagedUploadPaths(item, resolvePath, paths);
    }
  }

  return paths;
}
