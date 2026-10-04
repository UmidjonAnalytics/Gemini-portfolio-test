'use client';

import { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Save, Loader2, Upload, X, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

type LocalizedString = { en: string; ru: string; uz: string };

interface Profile {
  name: string;
  title: LocalizedString;
  tagline: LocalizedString;
  bio: LocalizedString;
  location: LocalizedString;
  languages: string;
  availability: 'open' | 'freelance' | 'busy';
  photoUrl: string;
  cvUrl: string;
  counters: {
    projects: number;
    experienceYears: number;
    tools: number;
    students: number;
  };
  socials: {
    email: string;
    linkedin: string;
    github: string;
    telegram: string;
    phone: string;
  };
}

const defaultProfile: Profile = {
  name: '',
  title: { en: '', ru: '', uz: '' },
  tagline: { en: '', ru: '', uz: '' },
  bio: { en: '', ru: '', uz: '' },
  location: { en: '', ru: '', uz: '' },
  languages: '',
  availability: 'open',
  photoUrl: '',
  cvUrl: '',
  counters: { projects: 0, experienceYears: 0, tools: 0, students: 0 },
  socials: { email: '', linkedin: '', github: '', telegram: '', phone: '' }
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'en' | 'ru' | 'uz'>('en');

  const photoInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const docRef = doc(db, 'profile', 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile({ ...defaultProfile, ...docSnap.data() } as Profile);
        }
      } catch (error) {
        console.error("Error loading profile", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'profile', 'main'), profile);
      toast.success('Profile saved successfully');
    } catch (error) {
      console.error("Error saving profile", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'photo' | 'cv'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPhoto = type === 'photo';
    const setUploading = isPhoto ? setUploadingPhoto : setUploadingCv;
    setUploading(true);

    try {
      const storageRef = ref(storage, `profile/${type}_${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      setProfile(prev => ({
        ...prev,
        [isPhoto ? 'photoUrl' : 'cvUrl']: url
      }));
      toast.success(`${isPhoto ? 'Photo' : 'CV'} uploaded successfully`);
    } catch (error) {
      console.error(`Error uploading ${type}`, error);
      toast.error(`Failed to upload ${type}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-white dark:bg-gray-800 h-96 rounded-xl"></div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
          Save Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info & Media */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Media</h2>

            {/* Photo Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Photo</label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4">
                {profile.photoUrl ? (
                  <div className="relative w-32 h-32 mb-4 group">
                    <img
                      src={profile.photoUrl}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full border-4 border-white dark:border-gray-700 shadow-sm"
                    />
                    <button
                      onClick={() => setProfile(p => ({ ...p, photoUrl: '' }))}
                      className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400">
                    <Upload size={32} />
                  </div>
                )}

                <input
                  type="file"
                  ref={photoInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'photo')}
                />
                <button
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                </button>
              </div>
            </div>

            {/* CV Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CV / Resume (PDF)</label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  ref={cvInputRef}
                  className="hidden"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e, 'cv')}
                />
                <button
                  onClick={() => cvInputRef.current?.click()}
                  disabled={uploadingCv}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center justify-center"
                >
                  <Upload size={16} className="mr-2" />
                  {uploadingCv ? 'Uploading...' : 'Upload PDF'}
                </button>
                {profile.cvUrl && (
                  <a
                    href={profile.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30"
                    title="View current CV"
                  >
                    <Globe size={20} />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Info</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Spoken Languages</label>
              <input
                type="text"
                value={profile.languages}
                onChange={(e) => setProfile(p => ({ ...p, languages: e.target.value }))}
                placeholder="e.g. English, Russian, Uzbek"
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Availability</label>
              <select
                value={profile.availability}
                onChange={(e) => setProfile(p => ({ ...p, availability: e.target.value as any }))}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
              >
                <option value="open">Open to work</option>
                <option value="freelance">Freelance only</option>
                <option value="busy">Not available</option>
              </select>
            </div>
          </div>
        </div>

        {/* Trilingual Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Localized Content</h2>

              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {(['en', 'ru', 'uz'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveTab(lang)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      activeTab === lang
                        ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Professional Title ({activeTab.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={profile.title[activeTab]}
                  onChange={(e) => setProfile(p => ({
                    ...p,
                    title: { ...p.title, [activeTab]: e.target.value }
                  }))}
                  placeholder={activeTab === 'en' ? 'e.g. Data Analyst' : ''}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tagline ({activeTab.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={profile.tagline[activeTab]}
                  onChange={(e) => setProfile(p => ({
                    ...p,
                    tagline: { ...p.tagline, [activeTab]: e.target.value }
                  }))}
                  placeholder="A short punchy sentence"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location ({activeTab.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={profile.location[activeTab]}
                  onChange={(e) => setProfile(p => ({
                    ...p,
                    location: { ...p.location, [activeTab]: e.target.value }
                  }))}
                  placeholder="e.g. London, UK (Remote)"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio ({activeTab.toUpperCase()})
                </label>
                <textarea
                  value={profile.bio[activeTab]}
                  onChange={(e) => setProfile(p => ({
                    ...p,
                    bio: { ...p.bio, [activeTab]: e.target.value }
                  }))}
                  rows={6}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Socials & Counters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Social Links</h2>

              {['email', 'linkedin', 'github', 'telegram', 'phone'].map((social) => (
                <div key={social}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                    {social}
                  </label>
                  <input
                    type="text"
                    value={profile.socials[social as keyof Profile['socials']]}
                    onChange={(e) => setProfile(p => ({
                      ...p,
                      socials: { ...p.socials, [social]: e.target.value }
                    }))}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                  />
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Counters</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Set to 0 to hide</p>

              {Object.entries(profile.counters).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={value}
                    onChange={(e) => setProfile(p => ({
                      ...p,
                      counters: { ...p.counters, [key]: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
