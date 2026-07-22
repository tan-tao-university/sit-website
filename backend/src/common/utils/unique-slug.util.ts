/**
 * Given a base slug and a checker that reports whether a slug is already
 * taken, returns a slug guaranteed to be free — appending -2, -3, ... to
 * the base slug until an unused one is found.
 */
export async function generateUniqueSlug(
  baseSlug: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  let candidate = baseSlug;
  let suffix = 2;

  while (await isTaken(candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix++;
  }

  return candidate;
}
