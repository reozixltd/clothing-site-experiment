// Pure helpers for the fitting room and the head-swap Space's event stream.

export const outfitSrc = (model: string, top: string, bottom: string) => `/fitting/${model}/${top}__${bottom}.webp`;
export const outfitKey = (model: string, top: string, bottom: string) => `${model}/${top}/${bottom}`;
export const pieceSrc = (kind: 'tops' | 'bottoms', id: string) => `/fitting/${kind}/${id}.webp`;

export type SwapResult = { ok: true; url: string } | { ok: false; error: string };

/** Reads a Gradio `/call/<fn>/<id>` event stream. Null until a `complete` or `error` event arrives. */
export function parseSwapStream(text: string): SwapResult | null {
  for (const block of text.split('\n\n')) {
    const event = /^event: (\w+)/m.exec(block)?.[1];
    const data = /^data: (.*)$/m.exec(block)?.[1] ?? 'null';
    if (event === 'error') {
      let error = 'error';
      try { error = JSON.parse(data)?.error ?? error; } catch { /* keep the generic message */ }
      return { ok: false, error: String(error) };
    }
    if (event === 'complete') {
      try {
        const url = JSON.parse(data)?.[0]?.[1]?.url; // [[original, result], seed]: the second image is the swap
        if (typeof url === 'string') return { ok: true, url };
      } catch { /* fall through */ }
      return { ok: false, error: 'bad result' };
    }
  }
  return null;
}
