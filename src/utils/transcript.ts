export type TranscriptType = 'srt' | 'text' | 'vtt';

export type TranscriptCue = {
  start: string;
  end: string;
  text: string;
};

export type TranscriptMarkdown = {
  cues: TranscriptCue[];
  paragraphs: string[];
  sourceText: string;
  error?: string;
};

const normalizeText = (value: string) =>
  value
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

const cleanupCueText = (value: string) =>
  value
    .replace(/<[^>]+>/g, '')
    .replace(/\{[^}]+\}/g, '')
    .replace(/\bspeaker_\d+:\s*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

const isTimingLine = (value: string) => value.includes('-->');

export const parseSrt = (source: string): TranscriptCue[] => {
  const text = normalizeText(source);
  if (!text) return [];

  return text
    .split(/\n{2,}/)
    .map((block) => block.split('\n').map((line) => line.trim()).filter(Boolean))
    .map((lines) => {
      const timingIndex = lines.findIndex(isTimingLine);
      if (timingIndex === -1) return null;

      const [start = '', end = ''] = lines[timingIndex].split('-->').map((part) => part.trim());
      const cueText = cleanupCueText(lines.slice(timingIndex + 1).join(' '));
      if (!cueText) return null;

      return { start, end, text: cueText } satisfies TranscriptCue;
    })
    .filter((cue): cue is TranscriptCue => Boolean(cue));
};

export const parseVtt = (source: string): TranscriptCue[] => {
  const text = normalizeText(source).replace(/^WEBVTT[^\n]*\n+/i, '');
  return parseSrt(text);
};

export const cuesToParagraphs = (cues: TranscriptCue[]) => {
  const paragraphs: string[] = [];
  let current = '';

  const flush = () => {
    const value = current.trim();
    if (value) paragraphs.push(value);
    current = '';
  };

  for (const cue of cues) {
    const text = cue.text.trim();
    if (!text) continue;

    current = current ? `${current}${needsSpaceBetween(current, text) ? ' ' : ''}${text}` : text;

    const shouldBreak = /[。！？!?]$/.test(text) && current.length >= 48;
    const tooLong = current.length >= 180;
    if (shouldBreak || tooLong) flush();
  }

  flush();
  return paragraphs;
};

const needsSpaceBetween = (left: string, right: string) => {
  const leftChar = left.at(-1) ?? '';
  const rightChar = right.at(0) ?? '';
  return /[A-Za-z0-9]/.test(leftChar) && /[A-Za-z0-9]/.test(rightChar);
};

const parseTranscriptText = (source: string, type: TranscriptType) => {
  if (type === 'vtt') {
    const cues = parseVtt(source);
    return { cues, paragraphs: cuesToParagraphs(cues), sourceText: source };
  }

  if (type === 'srt') {
    const cues = parseSrt(source);
    return { cues, paragraphs: cuesToParagraphs(cues), sourceText: source };
  }

  const paragraphs = normalizeText(source)
    .split(/\n{2,}/)
    .map((paragraph) => cleanupCueText(paragraph))
    .filter(Boolean);

  return { cues: [], paragraphs, sourceText: source };
};

export const loadTranscriptMarkdown = async (src: string, type: TranscriptType = 'srt'): Promise<TranscriptMarkdown> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(src, { signal: controller.signal });
    if (!response.ok) {
      return { cues: [], paragraphs: [], sourceText: '', error: `字幕请求失败：${response.status}` };
    }

    const sourceText = await response.text();
    return parseTranscriptText(sourceText, type);
  } catch (error) {
    const message = error instanceof Error ? error.message : '字幕解析失败';
    return { cues: [], paragraphs: [], sourceText: '', error: message };
  } finally {
    clearTimeout(timeout);
  }
};
