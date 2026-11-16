import { X } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { prepareFace } from '../lib/swapClient';

const CONSENT =
  'Your photo is sent to a free AI service on Hugging Face (a community-run third-party service, which may keep it) to make the preview. This site does not keep it.';

/** The "Try it on me" panel: photo tips, consent, then the photo picker (phones offer the camera). */
export function TryOn({ onPhoto, onClose }: { onPhoto: (face: Blob) => void; onClose: () => void }) {
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      onPhoto(await prepareFace(file));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fit__drawer fit__panel" role="dialog" aria-modal="true" aria-labelledby="tryon-title">
      <button className="fit__close" type="button" ref={closeRef} onClick={onClose} aria-label="Close">
        <X aria-hidden />
      </button>
      <h3 className="fit__name" id="tryon-title">
        Try it on me
      </h3>
      <p className="fit__tips">
        Use a photo of your head and shoulders, facing the camera, with no hat or sunglasses, in good light.
      </p>
      <label className="fit__consent">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        <span>{CONSENT}</span>
      </label>
      <label className="fit__cta fit__upload" data-disabled={!agreed || busy}>
        <input
          type="file"
          accept="image/*"
          disabled={!agreed || busy}
          onChange={(e) => {
            pick(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        {busy ? 'Reading your photo…' : 'Choose a photo'}
      </label>
      {error && (
        <p className="fit__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
