'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, writeBatch, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, GripVertical, Trash2, Edit2, Eye, EyeOff } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';

type LocalizedString = { en: string; ru: string; uz: string };

interface Skill {
  id: string;
  name: LocalizedString;
  category: 'bi' | 'programming' | 'databases' | 'soft';
  proficiency: number;
  icon: string; // Emoji or Lucide icon name
  order: number;
  published: boolean;
}

const defaultSkill: Omit<Skill, 'id'> = {
  name: { en: '', ru: '', uz: '' },
  category: 'bi',
  proficiency: 80,
  icon: '📊',
  order: 0,
  published: true,
};

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Skill | null>(null);
  const [activeLang, setActiveLang] = useState<'en' | 'ru' | 'uz'>('en');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'skills'), (snapshot) => {
      const skillsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Skill[];

      setSkills(skillsData.sort((a, b) => a.order - b.order));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    // Create a new array with the reordered items
    const reorderedSkills = Array.from(skills);
    const [movedItem] = reorderedSkills.splice(sourceIndex, 1);
    reorderedSkills.splice(destinationIndex, 0, movedItem);

    // Update local state immediately for smooth UI
    setSkills(reorderedSkills);

    // Update Firestore in batch
    try {
      const batch = writeBatch(db);
      reorderedSkills.forEach((skill, index) => {
        const docRef = doc(db, 'skills', skill.id);
        batch.update(docRef, { order: index });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error reordering skills", error);
      toast.error("Failed to save new order");
    }
  };

  const handleAddNew = () => {
    const newId = `new_${Date.now()}`;
    const newSkill: Skill = {
      id: newId,
      ...defaultSkill,
      order: skills.length
    };
    setEditForm(newSkill);
    setEditingId(newId);
  };

  const handleSave = async () => {
    if (!editForm || !editForm.name.en) {
      toast.error("English name is required");
      return;
    }

    try {
      const isNew = editForm.id.startsWith('new_');
      const docId = isNew ? doc(collection(db, 'skills')).id : editForm.id;

      const { id, ...dataToSave } = editForm;

      await setDoc(doc(db, 'skills', docId), dataToSave);
      toast.success(isNew ? "Skill added" : "Skill updated");
      setEditingId(null);
      setEditForm(null);
    } catch (error) {
      console.error("Error saving skill", error);
      toast.error("Failed to save skill");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this skill?")) {
      try {
        await deleteDoc(doc(db, 'skills', id));
        toast.success("Skill deleted");
      } catch (error) {
        console.error("Error deleting skill", error);
        toast.error("Failed to delete skill");
      }
    }
  };

  const togglePublish = async (skill: Skill) => {
    try {
      await setDoc(doc(db, 'skills', skill.id), { published: !skill.published }, { merge: true });
      toast.success(skill.published ? "Skill hidden" : "Skill published");
    } catch (error) {
      console.error("Error toggling publish status", error);
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-white dark:bg-gray-800 h-96 rounded-xl"></div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Skills & Tools</h1>
        <button
          onClick={handleAddNew}
          disabled={editingId !== null}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Skill
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="skills-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {skills.length === 0 && !editingId && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400">No skills added yet. Add your first skill!</p>
                </div>
              )}

              {/* Editing new item at top if it exists */}
              {editingId && editForm && editForm.id.startsWith('new_') && (
                <SkillEditor
                  skill={editForm}
                  onChange={setEditForm}
                  onSave={handleSave}
                  onCancel={() => { setEditingId(null); setEditForm(null); }}
                  activeLang={activeLang}
                  setActiveLang={setActiveLang}
                />
              )}

              {skills.map((skill, index) => (
                <Draggable key={skill.id} draggableId={skill.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`
                        ${snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500 z-50' : 'shadow-sm'}
                      `}
                    >
                      {editingId === skill.id ? (
                        <SkillEditor
                          skill={editForm!}
                          onChange={setEditForm}
                          onSave={handleSave}
                          onCancel={() => { setEditingId(null); setEditForm(null); }}
                          activeLang={activeLang}
                          setActiveLang={setActiveLang}
                        />
                      ) : (
                        <div className={`bg-white dark:bg-gray-800 rounded-xl border ${skill.published ? 'border-gray-100 dark:border-gray-700' : 'border-dashed border-gray-300 dark:border-gray-600 opacity-75'} p-4 flex items-center`}>
                          <div
                            {...provided.dragHandleProps}
                            className="p-2 mr-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical size={20} />
                          </div>

                          <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-xl mr-4 flex-shrink-0">
                            {skill.icon}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {skill.name.en || 'Unnamed Skill'}
                              {!skill.published && <span className="ml-2 text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Draft</span>}
                            </h3>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <span className="capitalize mr-3">{skill.category.replace('bi', 'BI Tools')}</span>
                              <span>{skill.proficiency}%</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                            <button
                              onClick={() => togglePublish(skill)}
                              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                              title={skill.published ? "Unpublish" : "Publish"}
                            >
                              {skill.published ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                            <button
                              onClick={() => { setEditForm(skill); setEditingId(skill.id); }}
                              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(skill.id)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

function SkillEditor({
  skill,
  onChange,
  onSave,
  onCancel,
  activeLang,
  setActiveLang
}: {
  skill: Skill;
  onChange: (s: Skill) => void;
  onSave: () => void;
  onCancel: () => void;
  activeLang: 'en' | 'ru' | 'uz';
  setActiveLang: (lang: 'en' | 'ru' | 'uz') => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-indigo-200 dark:border-indigo-800 p-4 shadow-sm relative">
      <div className="flex justify-between items-center mb-4 pb-2 border-b dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {skill.id.startsWith('new_') ? 'Add New Skill' : 'Edit Skill'}
        </h3>
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {(['en', 'ru', 'uz'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                activeLang === lang
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name ({activeLang.toUpperCase()}) *
          </label>
          <input
            type="text"
            value={skill.name[activeLang]}
            onChange={(e) => onChange({ ...skill, name: { ...skill.name, [activeLang]: e.target.value } })}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
            placeholder="e.g. Python"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
          <select
            value={skill.category}
            onChange={(e) => onChange({ ...skill, category: e.target.value as any })}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
          >
            <option value="bi">BI Tools</option>
            <option value="programming">Programming</option>
            <option value="databases">Databases</option>
            <option value="soft">Soft Skills</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Proficiency ({skill.proficiency}%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={skill.proficiency}
            onChange={(e) => onChange({ ...skill, proficiency: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon (Emoji)</label>
          <input
            type="text"
            value={skill.icon}
            onChange={(e) => onChange({ ...skill, icon: e.target.value })}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white text-xl"
            placeholder="🐍"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-4 pt-4 border-t dark:border-gray-700">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          Save
        </button>
      </div>
    </div>
  );
}
