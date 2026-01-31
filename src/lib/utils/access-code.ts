import { customAlphabet } from 'nanoid';

// Use uppercase alphanumeric without confusing characters (0, O, I, L)
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const generateCode = customAlphabet(ALPHABET, 12);

export function generateAccessCode(): string {
  const code = generateCode();
  // Format as XXXX-XXXX-XXXX
  return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
}

export function normalizeAccessCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function formatAccessCode(code: string): string {
  const normalized = normalizeAccessCode(code);
  if (normalized.length !== 12) return code;
  return `${normalized.slice(0, 4)}-${normalized.slice(4, 8)}-${normalized.slice(8, 12)}`;
}

export function validateAccessCode(code: string): boolean {
  const normalized = normalizeAccessCode(code);
  if (normalized.length !== 12) return false;
  return [...normalized].every((char) => ALPHABET.includes(char));
}
