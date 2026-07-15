import { describe, it, expect } from 'vitest';
import { normalize, tokenize, findResponse, getAiResponse, DEFAULT_RESPONSE } from './mockAi';

describe('normalize', () => {
  it('lowercases, trims and collapses whitespace', () => {
    expect(normalize('  Hello   World  ')).toBe('hello world');
  });

  it('handles empty/undefined input', () => {
    expect(normalize()).toBe('');
    expect(normalize('')).toBe('');
  });
});

describe('tokenize', () => {
  it('drops punctuation and stopwords, keeps meaningful terms', () => {
    expect(tokenize('What is a Promise in JavaScript?')).toEqual(['promise', 'javascript']);
  });
});

describe('findResponse', () => {
  it('returns the default response for empty input', () => {
    expect(findResponse('')).toBe(DEFAULT_RESPONSE);
  });

  it('matches on an exact question (case-insensitive)', () => {
    expect(findResponse('what is a promise in javascript?')).toContain(
      'eventual completion or failure of an asynchronous operation'
    );
  });

  it('matches via substring containment', () => {
    // The message contains extra words around the scripted question.
    expect(findResponse('Hey, what is the virtual DOM exactly?')).toContain(
      'lightweight copy of the real DOM'
    );
  });

  it('matches via token overlap when wording differs', () => {
    expect(findResponse('How can I improve security for my web app?')).toContain(
      'Improving web application security'
    );
  });

  it('falls back to the default response when nothing matches', () => {
    expect(findResponse('what is the meaning of life?')).toBe(DEFAULT_RESPONSE);
  });
});

describe('getAiResponse', () => {
  it('resolves to the matched response after the delay', async () => {
    const res = await getAiResponse('Can you explain RESTful APIs?', { delay: 0 });
    expect(res).toContain('Representational State Transfer');
  });
});
