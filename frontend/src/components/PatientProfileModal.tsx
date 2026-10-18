import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, Camera, Save, Plus, Trash2, Calendar, FileText, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Patient, PatientHealthNote } from '../types';
import { api } from '../services/api';

interface PatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onProfileUpdated: (updated: Patient) => void;
}

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({
  isOpen,
  onClose,
  patient,
  onProfileUpdated,
}) => {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [heightCm, setHeightCm] = useState<number | ''>('');
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [knownConditions, setKnownConditions] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

  const [notes, setNotes] = useState<PatientHealthNote[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (patient) {
      setFullName(patient.full_name || '');
      setAge(patient.age ?? '');
      setHeightCm(patient.height_cm ?? '');
      setWeightKg(patient.weight_kg ?? '');
      setKnownConditions(patient.known_conditions || '');
      setEmergencyName(patient.emergency_contact_name || '');
      setEmergencyPhone(patient.emergency_contact_phone || '');
      setBloodGroup(patient.blood_group || '');
      setProfilePictureUrl(patient.profile_picture_url || null);
    }
  }, [patient]);

  useEffect(() => {
    if (isOpen) {
      fetchNotes();
    }
  }, [isOpen]);

  const fetchNotes = async () => {
    try {
      const data = await api.getHealthNotes();
      setNotes(data);
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMsg({ type: 'error', text: 'Please select an image file (PNG, JPG, WEBP).' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProfilePictureUrl(event.target.result as string);
        setStatusMsg({ type: 'success', text: 'Profile picture attached! Click "Save Profile" to update permanently.' });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setStatusMsg(null);

    try {
      const updated = await api.updateMyPatientProfile({
        full_name: fullName,
        age: age === '' ? undefined : Number(age),
        height_cm: heightCm === '' ? undefined : Number(heightCm),
        weight_kg: weightKg === '' ? undefined : Number(weightKg),
        known_conditions: knownConditions,
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
        blood_group: bloodGroup,
        profile_picture_url: profilePictureUrl || undefined,
      });

      onProfileUpdated(updated);
      setStatusMsg({ type: 'success', text: 'Patient profile and photo updated successfully!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    setSavingNote(true);
    try {
      const created = await api.createHealthNote(newNoteText.trim());
      setNotes((prev) => [created, ...prev]);
      setNewNoteText('');
      setStatusMsg({ type: 'success', text: 'Health note recorded with timestamp.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to add health note' });
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await api.deleteHealthNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setStatusMsg({ type: 'success', text: 'Health note deleted.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to delete note' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">My Personal Health Profile & Clinical Notes</h3>
              <p className="text-xs text-slate-400">Editable profile metrics & timestamped health journal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {statusMsg && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Profile Picture Upload & Editable Stats Section */}
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              {/* Photo Upload Card */}
              <div className="flex flex-col items-center justify-center text-center space-y-2">
                <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-500/40 bg-slate-900 flex items-center justify-center shadow-lg">
                  {profilePictureUrl ? (
                    <img src={profilePictureUrl} alt="Patient Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-10 h-10 text-slate-500" />
                  )}
                  <label
                    htmlFor="profile-photo-input"
                    className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-[10px] text-cyan-300 font-semibold gap-1"
                  >
                    <Camera className="w-5 h-5 text-cyan-400" />
                    <span>Change</span>
                  </label>
                </div>
                <input
                  id="profile-photo-input"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                <label
                  htmlFor="profile-photo-input"
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 cursor-pointer text-[11px] font-semibold flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Upload Local Photo</span>
                </label>
              </div>

              {/* Patient Basic Fields */}
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Patient Full Name"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Age (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 42"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Height (cm)</label>
                  <input
                    type="number"
                    min="40"
                    max="250"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 175"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 70"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-slate-400 font-medium mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Unknown / Not provided</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            {/* Medical History & Emergency Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Known Medical Conditions</label>
                <textarea
                  rows={2}
                  value={knownConditions}
                  onChange={(e) => setKnownConditions(e.target.value)}
                  placeholder="e.g. Asthma, Hypertension, Diabetes Type 2"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Contact Name"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Emergency Contact Phone</label>
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold shadow-lg shadow-cyan-600/20 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{savingProfile ? 'Saving Profile...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>

          {/* Dated Health Notes Section */}
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h4 className="font-bold text-white text-sm">Dated Health Notes Journal</h4>
              </div>
              <span className="text-[11px] text-slate-400">{notes.length} saved entries</span>
            </div>

            {/* New Note Form */}
            <form onSubmit={handleAddNote} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <textarea
                rows={2}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Write personal health observation or symptom note (e.g. Mild headache after morning jog, taken rest)..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingNote || !newNoteText.trim()}
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold text-xs transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{savingNote ? 'Recording...' : 'Save Note with Timestamp'}</span>
                </button>
              </div>
            </form>

            {/* Scrollable Timeline of Dated Notes */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {notes.length === 0 ? (
                <div className="p-6 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
                  No health notes recorded yet. Add your first note above to track health events over time.
                </div>
              ) : (
                notes.map((n) => {
                  const dateObj = new Date(n.created_at);
                  const formattedDate = dateObj.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div
                      key={n.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[11px] text-cyan-400 font-mono">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formattedDate} at {formattedTime}</span>
                        </div>
                        <p className="text-slate-200 text-xs leading-relaxed">{n.note_text}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteNote(n.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors flex-shrink-0"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
