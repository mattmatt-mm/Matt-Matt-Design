export const MAX_QUESTION_CHARS = 500;
export const MAX_EMAIL_CHARS = 254;
export const MAX_NOTE_CHARS = 600;
export const MAX_AI_WORDS = 100;

/** Questions one visitor may ask before the conversation hands off to email. */
export const MAX_AI_TURNS = 10;

const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });

function countWords(value: string) {
  let count = 0;
  for (const segment of segmenter.segment(value)) {
    if (segment.isWordLike) count += 1;
  }
  return count;
}

/** Index just past the last sentence end in `value`, or 0 if there is none. */
function lastSentenceEnd(value: string) {
  let end = 0;
  for (const match of value.matchAll(/[.!?。！？](?=\s|$)|[。！？]/gu)) {
    end = (match.index ?? 0) + match[0].length;
  }
  return end;
}

/** Below this many words text streams straight through. */
const SOFT_WORDS = 60;

/**
 * Enforce the visible 100-word ceiling without ever ending mid-sentence.
 * Short answers stream through untouched. Past the soft mark, text is held
 * back until its sentence ends and released only if that sentence still fits
 * under the ceiling; a sentence that would cross it is dropped whole, so a
 * long answer stops at its last complete sentence instead of on a dangling
 * word.
 */
export function limitTextStream(
  source: ReadableStream<string>,
  maximum = MAX_AI_WORDS,
) {
  let emitted = "";
  let pending = "";
  let capped = false;

  return source.pipeThrough(
    new TransformStream<string, string>({
      transform(chunk, controller) {
        if (capped) return;
        pending += chunk;
        if (countWords(emitted + pending) <= SOFT_WORDS) {
          controller.enqueue(pending);
          emitted += pending;
          pending = "";
          return;
        }
        const end = lastSentenceEnd(pending);
        if (!end) return;
        const sentence = pending.slice(0, end);
        if (countWords(emitted + sentence) > maximum) {
          capped = true;
          return;
        }
        controller.enqueue(sentence);
        emitted += sentence;
        pending = pending.slice(end);
      },
      flush(controller) {
        if (capped || !pending) return;
        if (countWords(emitted + pending) <= maximum) controller.enqueue(pending);
      },
    }),
  );
}
