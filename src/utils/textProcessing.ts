import type { Paragraph } from '../types';

/**
 * Splits text into paragraphs, handling various paragraph formats
 */
export function splitIntoParagraphs(text: string): string[] {
  if (!text.trim()) {
    return [];
  }

  // Normalize line endings
  const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Split by double line breaks (most common paragraph separator)
  let paragraphs = normalizedText.split(/\n\s*\n/);
  
  // If no double line breaks found, try single line breaks
  if (paragraphs.length === 1) {
    paragraphs = normalizedText.split(/\n/);
  }
  
  // Clean up paragraphs
  return paragraphs
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .filter(p => !isLikelyNotParagraph(p));
}

/**
 * Determines if a text segment is likely not a paragraph (e.g., headers, page numbers)
 */
function isLikelyNotParagraph(text: string): boolean {
  const trimmed = text.trim();
  
  // Skip very short segments (likely headers or page numbers)
  if (trimmed.length < 10) {
    return true;
  }
  
  // Skip segments that are all caps (likely headers)
  if (trimmed === trimmed.toUpperCase() && trimmed.length < 100) {
    return true;
  }
  
  // Skip segments that look like page numbers or chapter headers
  if (/^(page|chapter|section)\s*\d+$/i.test(trimmed)) {
    return true;
  }
  
  // Skip segments that are just numbers
  if (/^\d+$/.test(trimmed)) {
    return true;
  }
  
  return false;
}

/**
 * Creates paragraph objects from text segments
 */
export function createParagraphs(textSegments: string[]): Paragraph[] {
  return textSegments.map((text, index) => ({
    id: `paragraph-${index}`,
    originalText: text,
    status: 'pending' as const,
    retryCount: 0
  }));
}

/**
 * Combines rewritten paragraphs into a complete story
 */
export function combineRewrittenText(paragraphs: Paragraph[]): string {
  return paragraphs
    .filter(p => p.status === 'completed' && p.rewrittenText)
    .map(p => p.rewrittenText)
    .join('\n\n');
}

/**
 * Estimates reading time for text
 */
export function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Counts words in text
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

/**
 * Validates if text is suitable for processing
 */
export function validateText(text: string): { isValid: boolean; message?: string } {
  if (!text.trim()) {
    return { isValid: false, message: 'Please enter some text to rewrite.' };
  }
  
  if (text.trim().length < 50) {
    return { isValid: false, message: 'Text is too short. Please enter at least 50 characters.' };
  }
  
  const wordCount = countWords(text);
  if (wordCount > 10000) {
    return { isValid: false, message: 'Text is too long. Please limit to 10,000 words or less.' };
  }
  
  return { isValid: true };
}
