export type McqOption = { letter: string; text: string };

export type ParsedMcq = { stem: string; options: McqOption[] };

function parseOptionLine(line: string): { letter: string; text: string } | null {
  const t = line.trim();
  let m = t.match(/^\(([A-Ea-e])\)\s*(.+)$/i);
  if (m) return { letter: m[1].toUpperCase(), text: m[2].trim() };
  m = t.match(/^([A-Ea-e])\)\s*(.+)$/i);
  if (m) return { letter: m[1].toUpperCase(), text: m[2].trim() };
  m = t.match(/^([A-Ea-e])\.\s*(.+)$/i);
  if (m) return { letter: m[1].toUpperCase(), text: m[2].trim() };
  return null;
}

/** Split stem + A–E options from generated MCQ question text. */
export function parseMcqFromText(full: string): ParsedMcq | null {
  const lines = full
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) return null;

  let firstOptionIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (parseOptionLine(lines[i])) {
      firstOptionIdx = i;
      break;
    }
  }
  if (firstOptionIdx < 0) return null;

  const options: McqOption[] = [];
  for (let i = firstOptionIdx; i < lines.length; i++) {
    const o = parseOptionLine(lines[i]);
    if (!o) break;
    options.push(o);
  }
  if (options.length < 2) return null;

  const stem = lines.slice(0, firstOptionIdx).join('\n').trim();
  if (!stem) return null;

  return { stem, options };
}

/** Derive correct option letter from API `answer` field (aligns with server MCQ grading). */
export function extractMcqCorrectLetter(answer: string, options: McqOption[]): string | null {
  const a = (answer || '').trim();
  if (!a) return null;

  const letters = new Set(options.map((o) => o.letter));
  if (a.length === 1 && /^[A-E]$/i.test(a)) {
    const L = a.toUpperCase();
    return letters.has(L) ? L : null;
  }

  const firstWord = a.match(/^([A-E])(?:[\.\)]|$)/i);
  if (firstWord && letters.has(firstWord[1].toUpperCase())) {
    return firstWord[1].toUpperCase();
  }

  const anywhere = a.match(/\b([A-E])\b/i);
  if (anywhere && letters.has(anywhere[1].toUpperCase())) {
    return anywhere[1].toUpperCase();
  }

  const low = a.toLowerCase();
  for (const o of options) {
    const ot = o.text.toLowerCase();
    if (!ot) continue;
    if (low === ot || low.includes(ot) || ot.includes(low)) {
      return o.letter;
    }
  }

  return null;
}
