import { pool } from '../../db';
import {
  collectManagedUploadPaths,
  ManagedPathResolver,
} from './upload-path.util';

const scalarReferencesSql = `
  SELECT banner AS value FROM program WHERE banner IS NOT NULL
  UNION ALL SELECT banner FROM curriculum WHERE banner IS NOT NULL
  UNION ALL SELECT pdf_url FROM curriculum WHERE pdf_url IS NOT NULL
  UNION ALL SELECT avatar_url FROM "user" WHERE avatar_url IS NOT NULL
  UNION ALL SELECT cover_image FROM news WHERE cover_image IS NOT NULL
  UNION ALL SELECT image_url FROM popup_banner WHERE image_url IS NOT NULL
  UNION ALL SELECT pdf_url FROM research WHERE pdf_url IS NOT NULL
  UNION ALL SELECT cover_image FROM achievement WHERE cover_image IS NOT NULL
  UNION ALL SELECT avatar_url FROM alumni WHERE avatar_url IS NOT NULL
  UNION ALL SELECT avatar_url FROM faculty WHERE avatar_url IS NOT NULL
  UNION ALL SELECT pdf_url_vi FROM handbook WHERE pdf_url_vi IS NOT NULL
  UNION ALL SELECT pdf_url_en FROM handbook WHERE pdf_url_en IS NOT NULL
`;

const jsonReferencesSql = `
  SELECT document AS value FROM content WHERE document IS NOT NULL
  UNION ALL SELECT document FROM content_translation WHERE document IS NOT NULL
  UNION ALL SELECT content FROM news WHERE content IS NOT NULL
  UNION ALL SELECT content FROM news_translation WHERE content IS NOT NULL
  UNION ALL SELECT content_vi FROM handbook WHERE content_vi IS NOT NULL
  UNION ALL SELECT content_en FROM handbook WHERE content_en IS NOT NULL
`;

export async function findReferencedUploadPaths(
  resolvePath: ManagedPathResolver,
): Promise<Set<string>> {
  const [scalarReferences, jsonReferences] = await Promise.all([
    pool.query<{ value: unknown }>(scalarReferencesSql),
    pool.query<{ value: unknown }>(jsonReferencesSql),
  ]);

  const paths = new Set<string>();
  for (const row of scalarReferences.rows) {
    collectManagedUploadPaths(row.value, resolvePath, paths);
  }
  for (const row of jsonReferences.rows) {
    collectManagedUploadPaths(row.value, resolvePath, paths);
  }
  return paths;
}
