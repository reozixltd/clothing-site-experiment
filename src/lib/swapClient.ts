// "Try it on me": the visitor's whole head onto the model photo, via a free community
// Hugging Face Space (BFS head swap), called straight from the browser with plain fetch.
import { parseSwapStream } from './headswap';

// ponytail: one hardcoded community Space; swap this constant if it disappears.
const SPACE = 'https://hugging-apps-bfs-best-face-swap.hf.space';
const PARAMS = ['Turbo · Viggle 6-step', 1024, 6, 1, 42, false]; // model, resolution, steps, lora scale, seed, randomize
const MAX_BYTES = 15 * 1024 * 1024;
const LONG_SIDE = 1024;

/** Checks, rotates (EXIF) and shrinks the visitor's photo to a 1024 px JPEG. Throws a message to show. */
export async function prepareFace(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('That file is not a photo. Try a JPEG or PNG.');
  if (file.size > MAX_BYTES) throw new Error('That photo is over 15 MB. Try a smaller one.');
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error("We couldn't read that photo. Try a JPEG or PNG.");
  }
  const k = Math.min(1, LONG_SIDE / Math.max(bmp.width, bmp.height));
  const canvas = new OffscreenCanvas(Math.round(bmp.width * k), Math.round(bmp.height * k));
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  return canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 });
}

let prompt: Promise<string> | null = null;
const defaultPrompt = (signal: AbortSignal) =>
  (prompt ??= fetch(`${SPACE}/gradio_api/info`, { signal })
    .then((r) => r.json())
    .then((d) => d.named_endpoints['/face_swap'].parameters[8].parameter_default as string)
    .catch((e) => {
      prompt = null; // try again next time
      throw e;
    }));

async function upload(blob: Blob, name: string, signal: AbortSignal) {
  const form = new FormData();
  form.append('files', blob, name);
  const r = await fetch(`${SPACE}/gradio_api/upload`, { method: 'POST', body: form, signal });
  if (!r.ok) throw new Error(`upload ${r.status}`);
  const [path] = (await r.json()) as string[];
  return { path, meta: { _type: 'gradio.FileData' } };
}

/**
 * Puts the face on the outfit photo and resolves an object URL of the result (revoke it when done).
 * The outfit is fetched here and uploaded too: the Space can't reach this site on localhost.
 * Rejects on a Space error, a bad result, abort, or after 120 s.
 */
export async function headSwap(face: Blob, outfitUrl: string, signal: AbortSignal): Promise<string> {
  const s = AbortSignal.any([signal, AbortSignal.timeout(120_000)]);
  const outfit = await (await fetch(outfitUrl, { signal: s })).blob();
  const [faceFile, outfitFile, text] = await Promise.all([
    upload(face, 'face.jpg', s),
    upload(outfit, 'outfit.webp', s),
    defaultPrompt(s),
  ]);
  const call = await fetch(`${SPACE}/gradio_api/call/face_swap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: [faceFile, outfitFile, ...PARAMS, text] }),
    signal: s,
  });
  if (!call.ok) throw new Error(`call ${call.status}`);
  const { event_id } = await call.json();

  const stream = await fetch(`${SPACE}/gradio_api/call/face_swap/${event_id}`, { signal: s });
  const reader = stream.body!.pipeThrough(new TextDecoderStream()).getReader();
  let seen = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (value) seen += value;
    // Only whole events: a half-arrived `complete` line would read as a bad result.
    const result = parseSwapStream(seen.slice(0, seen.lastIndexOf('\n\n') + 2));
    if (result) {
      reader.cancel().catch(() => {});
      if (!result.ok) throw new Error(result.error);
      // Kept as an object URL: the Space deletes its files after a while.
      return URL.createObjectURL(await (await fetch(result.url, { signal: s })).blob());
    }
    if (done) throw new Error('stream ended');
  }
}
