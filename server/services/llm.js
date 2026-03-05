import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadsDir = join(__dirname, '..', 'uploads');

const client = new Anthropic();

const MIME_MAP = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf'
};

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 2000;

/**
 * Invoke Claude with optional images and JSON schema enforcement.
 * Includes retry logic with exponential backoff for transient failures.
 *
 * @param {object} params
 * @param {string} params.prompt - Text prompt
 * @param {string[]} [params.file_urls] - Array of /uploads/... paths or external URLs
 * @param {object} [params.response_json_schema] - Expected JSON response schema (we parse JSON from response)
 * @returns {object|string} Parsed JSON response or raw text
 */
export async function invokeLLM({ prompt, file_urls = [], response_json_schema }) {
  const model = process.env.LLM_MODEL || 'claude-sonnet-4-20250514';
  const content = [];

  // Add images first
  for (const url of file_urls) {
    if (url.startsWith('/uploads/')) {
      const filePath = join(uploadsDir, url.replace('/uploads/', ''));
      const ext = extname(filePath).toLowerCase();
      const mediaType = MIME_MAP[ext] || 'image/png';
      try {
        const data = readFileSync(filePath).toString('base64');
        content.push({
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data }
        });
      } catch (err) {
        console.warn(`[LLM] Could not read file ${filePath}: ${err.message}`);
      }
    } else if (url.startsWith('http://') || url.startsWith('https://')) {
      content.push({
        type: 'image',
        source: { type: 'url', url }
      });
    }
  }

  // Add text prompt
  content.push({ type: 'text', text: prompt });

  // Retry loop with exponential backoff
  let lastError;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await client.messages.create({
        model,
        max_tokens: 16384,
        messages: [{ role: 'user', content }],
      });

      // Extract text from response
      const rawText = response.content
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('');

      // Log usage for monitoring
      if (response.usage) {
        console.log(`[LLM] ${model} | in=${response.usage.input_tokens} out=${response.usage.output_tokens} | attempt=${attempt + 1}`);
      }

      // Try to parse as JSON if schema was requested
      if (response_json_schema) {
        return parseJsonResponse(rawText);
      }

      return rawText;
    } catch (err) {
      lastError = err;
      const isRetryable = isRetryableError(err);
      console.warn(`[LLM] Attempt ${attempt + 1}/${MAX_RETRIES} failed: ${err.message}${isRetryable ? ' (retryable)' : ' (fatal)'}`);

      if (!isRetryable || attempt === MAX_RETRIES - 1) {
        break;
      }

      // Exponential backoff: 2s, 4s, 8s...
      const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
      console.log(`[LLM] Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Determine if an error is transient and worth retrying.
 */
function isRetryableError(err) {
  // Rate limit (429)
  if (err.status === 429) return true;
  // Server errors (500, 502, 503, 529)
  if (err.status >= 500) return true;
  // Network errors
  if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') return true;
  // Anthropic overloaded
  if (err.error?.type === 'overloaded_error') return true;
  return false;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parse JSON from LLM response, handling markdown code fences.
 */
function parseJsonResponse(text) {
  let cleaned = text.trim();

  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  const fenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to find JSON object or array in the text
    const jsonMatch = cleaned.match(/[\[{][\s\S]*[\]}]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // Return raw text if all parsing fails
        console.warn('[LLM] JSON parse failed, returning raw text');
        return { raw_text: text, parse_error: true };
      }
    }
    return { raw_text: text, parse_error: true };
  }
}
