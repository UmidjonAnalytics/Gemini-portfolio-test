'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, writeBatch, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, GripVertical, Trash2, Edit2, Eye, EyeOff } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';

type LocalizedString = { en: string; ru: string; uz: string };

interface Education {
  id: string;
  institution: LocalizedString;
  degree: LocalizedString;
  field: LocalizedString;
  startDate: string; // YYYY
  endDate: string; // YYYY or 'present'
  order: number;
  published: boolean;
}

const defaultEducation: Omit<Education, 'id'> = {
  institution: { en: '', ru: '', uz: '' },
  degree: { en: '', ru: '', uz: '' },
  field: { en: '', ru: '', uz: '' },
  startDate: '',
  endDate: '',
  order: 0,
  published: true,
};

export default function EducationPage() {
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Education | null>(null);
  const [activeLang, setActiveLang] = useState<'en' | 'ru' | 'uz'>('en');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'education'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Education[];
      setEducation(data.sort((a, b) => a.order - b.order));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    const reordered = Array.from(education);
    const [movedItem] = reordered.splice(sourceIndex, 1);
    reordered.splice(destinationIndex, 0, movedItem);

    setEducation(reordered);

    try {
      const batch = writeBatch(db);
      reordered.forEach((item, index) => {
        batch.update(doc(db, 'education', item.id), { order: index });
      });
      await batch.commit();
    } catch (error) {
      toast.error("Failed to save new order");
    }
  };

  const handleAddNew = () => {
    const newId = `new_${Date.now()}`;
    setEditForm({ id: newId, ...defaultEducation, order: education.length });
    setEditingId(newId);
  };

  const handleSave = async () => {
    if (!editForm || !editForm.institution.en || !editForm.degree.en) {
      toast.error("English institution and degree are required");
      return;
    }

    try {
      const isNew = editForm.id.startsWith('new_');
      const docId = isNew ? doc(collection(db, 'education')).id : editForm.id;
      const { id, ...dataToSave } = editForm;

      await setDoc(doc(db, 'education', docId), dataToSave);
      toast.success(isNew ? "Education added" : "Education updated");
      setEditingId(null);
      setEditForm(null);
    } catch (error) {
      toast.error("Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await deleteDoc(doc(db, 'education', id));
        toast.success("Entry deleted");
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  const togglePublish = async (item: Education) => {
    try {
      await setDoc(doc(db, 'education', item.id), { published: !item.published }, { merge: true });
      toast.success(item.published ? "Hidden" : "Published");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <div className="animate-pulse bg-white dark:bg-gray-800 h-96 rounded-xl"></div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Education</h1>
        <button
          onClick={handleAddNew}
          disabled={editingId !== null}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Education
        </button>
      </div>

      {!editingId && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="education-list">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {education.length === 0 && (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">No education added yet.</p>
                  </div>
                )}

                {education.map((item, index) => (
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

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                              {item.degree.en || 'Untitled Degree'} - {item.institution.en}
                            </h3>
                            {!item.published && <span className="ml-2 text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Draft</span>}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {item.startDate} — {item.endDate === 'present' ? 'Present' : item.endDate}
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
        <EducationEditor
          item={editForm} onChange={setEditForm} onSave={handleSave} onCancel={() => { setEditingId(null); setEditForm(null); }}
          activeLang={activeLang} setActiveLang={setActiveLang}
        />
      )}
    </div>
  );
}

function EducationEditor({ item, onChange, onSave, onCancel, activeLang, setActiveLang }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {item.id.startsWith('new_') ? 'Add Education' : 'Edit Education'}
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Institution Name ({activeLang}) *</label>
          <input
            type="text"
            value={item.institution[activeLang]}
            onChange={(e) => onChange({ ...item, institution: { ...item.institution, [activeLang]: e.target.value } })}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Degree ({activeLang}) *</label>
          <input
            type="text"
            value={item.degree[activeLang]}
            onChange={(e) => onChange({ ...item, degree: { ...item.degree, [activeLang]: e.target.value } })}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
            placeholder="e.g. Bachelor of Science"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Field of Study ({activeLang})</label>
          <input
            type="text"
            value={item.field[activeLang]}
            onChange={(e) => onChange({ ...item, field: { ...item.field, [activeLang]: e.target.value } })}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
            placeholder="e.g. Computer Science"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Year</label>
          <input
            type="number"
            min="1950"
            max="2050"
            value={item.startDate}
            onChange={(e) => onChange({ ...item, startDate: e.target.value })}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
            placeholder="YYYY"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Year</label>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={item.endDate === 'present' ? '' : item.endDate}
              disabled={item.endDate === 'present'}
              onChange={(e) => onChange({ ...item, endDate: e.target.value })}
              className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white disabled:opacity-50"
              placeholder="YYYY"
            />
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={item.endDate === 'present'}
                onChange={(e) => onChange({ ...item, endDate: e.target.checked ? 'present' : '' })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Present</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
        <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">Cancel</button>
        <button onClick={onSave} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Education</button>
      </div>
    </div>
  );
}
