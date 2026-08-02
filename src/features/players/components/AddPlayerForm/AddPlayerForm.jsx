import { useState } from 'react';
import { PLAYER_POSITIONS, PLAYER_POSITION_LABELS } from '@/constants/playerPositions';
import { fileToDataUrl } from '@/utils/fileToDataUrl';
import './AddPlayerForm.css';

const EMPTY_FORM = {
  name: '',
  jerseyNumber: '',
  position: PLAYER_POSITIONS.FORWARD,
  year: '',
  photoUrl: null,
};

export default function AddPlayerForm({ onAdd }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [isOpen, setIsOpen] = useState(false);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setForm((f) => ({ ...f, photoUrl: dataUrl }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.jerseyNumber) return;

    onAdd({
      ...form,
      jerseyNumber: Number(form.jerseyNumber),
    });
    setForm(EMPTY_FORM);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button type="button" className="btn btn-outline add-player-form__open" onClick={() => setIsOpen(true)}>
        + Add Player
      </button>
    );
  }

  return (
    <form className="add-player-form" onSubmit={handleSubmit}>
      <div className="add-player-form__grid">
        <input
          type="text"
          placeholder="Full name"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <input
          type="number"
          placeholder="Jersey #"
          required
          value={form.jerseyNumber}
          onChange={(e) => setForm((f) => ({ ...f, jerseyNumber: e.target.value }))}
        />
        <select
          value={form.position}
          onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
        >
          {Object.values(PLAYER_POSITIONS).map((pos) => (
            <option key={pos} value={pos}>
              {PLAYER_POSITION_LABELS[pos]}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Year (e.g. 2nd Year)"
          value={form.year}
          onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
        />
        <label className="add-player-form__photo">
          {form.photoUrl ? (
            <img src={form.photoUrl} alt="" />
          ) : (
            <span>+ Photo</span>
          )}
          <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
        </label>
      </div>

      <div className="add-player-form__actions">
        <button type="submit" className="btn btn-primary">
          Save Player
        </button>
        <button type="button" className="btn btn-outline" onClick={() => setIsOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
