import { useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { cloudinaryReady, uploadImage } from '../../utils/cloudinary';
import Button from './Button';
import { Avatar } from './Layout';

export default function ImageUploader({ label = 'Photo', value, onChange, name }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      onChange(await uploadImage(file));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="mb-1 text-sm font-medium text-ink-700">{label}</p>
      <div className="flex items-center gap-4">
        <Avatar name={name} src={value || null} size="lg" />
        <div>
          <Button variant="secondary" size="sm" icon={ImagePlus} loading={busy} disabled={!cloudinaryReady} onClick={() => input.current?.click()}>
            {value ? 'Change photo' : 'Upload photo'}
          </Button>
          <input ref={input} type="file" accept="image/*" className="sr-only" onChange={pick} aria-label={label} />
          {!cloudinaryReady && <p className="mt-1 text-sm text-amber-700">Upload is not configured yet. Add the Cloudinary values to .env.</p>}
          {error && <p role="alert" className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}