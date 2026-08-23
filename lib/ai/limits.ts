export const MAX_QUESTION_CHARS = 500;
export const MAX_EMAIL_CHARS = 254;
export const MAX_NOTE_CHARS = 600;
export const MAX_AI_WORDS = 100;

const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });

function truncateWords(value: string, maximum: number) {
  let count = 0;
  for (const segment of segmenter.segment(value)) {
    if (!segment.isWordLike) continue;
    count += 1;
    if (count > maximum) return value.slice(0, segment.index).trimEnd();
  }
  return value;
}

/** Enforce the visible 100-word ceiling without buffering the whole answer. */
export function limitTextStream(
  source: ReadableStream<string>,
  maximum = MAX_AI_WORDS,
) {
  let emitted = "";
  let capped = false;

  return source.pipeThrough(
    new TransformStream<string, string>({
      transform(chunk, controller) {
        if (capped) return;
        const next = emitted + chunk;
        const limited = truncateWords(next, maximum);
        const delta = limited.slice(emitted.length);
        if (delta) controller.enqueue(delta);
        emitted = limited;
        if (limited.length < next.length) capped = true;
      },
    }),
  );
}
