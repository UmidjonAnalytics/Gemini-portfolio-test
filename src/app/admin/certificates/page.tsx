'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, doc, writeBatch, deleteDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Plus, GripVertical, Trash2, Edit2, Loader2, Eye, EyeOff, Upload, X } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import Image from 'next/image';

type LocalizedString = { en: string; ru: string; uz: string };

interface Certificate {
  id: string;
  name: LocalizedString;
  issuer: string;
  date: string;
  credentialId: string;
  url: string;
  image: string;
  order: number;
  published: boolean;
}

const defaultCertificate: Omit<Certificate, 'id'> = {
  name: { en: '', ru: '', uz: '' },
  issuer: '',
  date: '',
  credentialId: '',
  url: '',
  image: '',
  order: 0,
  published: true,
};

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Certificate | null>(null);
  const [activeLang, setActiveLang] = useState<'en' | 'ru' | 'uz'>('en');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'certificates'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Certificate[];

      setCertificates(data.sort((a, b) => a.order - b.order));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    const reordered = Array.from(certificates);
    const [movedItem] = reordered.splice(sourceIndex, 1);
    reordered.splice(destinationIndex, 0, movedItem);

    setCertificates(reordered);

    try {
      const batch = writeBatch(db);
      reordered.forEach((item, index) => {
        batch.update(doc(db, 'certificates', item.id), { order: index });
      });
      await batch.commit();
    } catch (error) {
      toast.error("Failed to save new order");
    }
  };

  const handleAddNew = () => {
    const newId = `new_${Date.now()}`;
    setEditForm({ id: newId, ...defaultCertificate, order: certificates.length });
    setEditingId(newId);
  };

  const handleSave = async () => {
    if (!editForm || !editForm.name.en || !editForm.issuer) {
      toast.error("English name and issuer are required");
      return;
    }

    try {
      const isNew = editForm.id.startsWith('new_');
      const docId = isNew ? doc(collection(db, 'certificates')).id : editForm.id;
      const { id, ...dataToSave } = editForm;

      await setDoc(doc(db, 'certificates', docId), dataToSave);
      toast.success(isNew ? "Certificate added" : "Certificate updated");
      setEditingId(null);
      setEditForm(null);
    } catch (error) {
      toast.error("Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this certificate?")) {
      try {
        await deleteDoc(doc(db, 'certificates', id));
        toast.success("Certificate deleted");
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  const togglePublish = async (item: Certificate) => {
    try {
      await setDoc(doc(db, 'certificates', item.id), { published: !item.published }, { merge: true });
      toast.success(item.published ? "Hidden" : "Published");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <div className="animate-pulse bg-white dark:bg-gray-800 h-96 rounded-xl"></div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Certificates</h1>
        <button
          onClick={handleAddNew}
          disabled={editingId !== null}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Certificate
        </button>
      </div>

      {!editingId && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="cert-list">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {certificates.length === 0 && (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">No certificates added yet.</p>
                  </div>
                )}

                {certificates.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-white dark:bg-gray-800 rounded-xl border ${item.published ? 'border-gray-100 dark:border-gray-700' : 'border-dashed border-gray-300 dark:border-gray-600 opacity-75'} p-4 flex items-center ${snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500 z-50' : 'shadow-sm'}`}
                      >
                        <div {...provided.dragHandleProps} className="p-2 mr-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                          <GripVertical size={20} />
                        </div>

                        <div className="w-24 h-16 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden mr-4 flex-shrink-0 relative border dark:border-gray-600">
                          {item.image ? (
                            <Image src={item.image} alt="" fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No img</div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                              {item.name.en || 'Untitled'}
                            </h3>
                            {!item.published && <span className="ml-2 text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Draft</span>}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                            {item.issuer} • {item.date}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                          <button onClick={() => togglePublish(item)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg">
                            {item.published ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                          <button onClick={() => { setEditForm(item); setEditingId(item.id); }} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {editingId && editForm && (
        <CertificateEditor
          item={editForm} onChange={setEditForm} onSave={handleSave} onCancel={() => { setEditingId(null); setEditForm(null); }}
          activeLang={activeLang} setActiveLang={setActiveLang}
        />
      )}
    </div>
  );
}

function CertificateEditor({ item, onChange, onSave, onCancel, activeLang, setActiveLang }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `certificates/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      onChange({ ...item, image: url });
      toast.success("Image uploaded");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {item.id.startsWith('new_') ? 'Add Certificate' : 'Edit Certificate'}
        </h2>
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {(['en', 'ru', 'uz'] as const).map((lang) => (
            <button key={lang} onClick={() => setActiveLang(lang)} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${activeLang === lang ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Certificate Name ({activeLang}) *</label>
          <input
            type="text"
            value={item.name[activeLang]}
            onChange={(e) => onChange({ ...item, name: { ...item.name, [activeLang]: e.target.value } })}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issuer / Organization *</label>
          <input
            type="text"
            value={item.issuer}
            onChange={(e) => onChange({ ...item, issuer: e.target.value })}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
          <input
            type="month"
            value={item.date}
            onChange={(e) => onChange({ ...item, date: e.target.value })}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Credential ID</label>
          <input
            type="text"
            value={item.credentialId}
            onChange={(e) => onChange({ ...item, credentialId: e.target.value })}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Verification URL</label>
          <input
            type="url"
            value={item.url}
            onChange={(e) => onChange({ ...item, url: e.target.value })}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Certificate Image (High Res)</label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 flex flex-col items-center max-w-md">
          {item.image ? (
            <div className="relative w-full aspect-[4/3] mb-4 rounded-lg overflow-hidden group border dark:border-gray-700">
              <img src={item.image} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => onChange({ ...item, image: '' })}
                className="absolute top-2 right-2 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="w-full aspect-[4/3] mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 border dark:border-gray-600">
              <Upload size={32} />
            </div>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
        <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">Cancel</button>
        <button onClick={onSave} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Certificate</button>
      </div>
    </div>
  );
}
