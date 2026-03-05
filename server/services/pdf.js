import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadsDir = join(__dirname, '..', 'uploads');

/**
 * Extract text from a PDF file using unpdf.
 * @param {string} fileUrl - The /uploads/... path
 * @returns {{ full_text: string, pages: string[], total_pages: number }}
 */
export async function extractPdfText(fileUrl) {
  // Dynamic import to handle unpdf's ESM-only nature
  const { extractText, getDocumentProxy } = await import('unpdf');

  const filePath = fileUrl.startsWith('/uploads/')
    ? join(uploadsDir, fileUrl.replace('/uploads/', ''))
    : fileUrl;

  const buffer = readFileSync(filePath);
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text, totalPages } = await extractText(pdf, { mergePages: false });

  // text is an array of page texts when mergePages is false
  const pages = Array.isArray(text) ? text : [text];

  return {
    full_text: pages.join('\n\n--- Page Break ---\n\n'),
    pages,
    total_pages: totalPages
  };
}
