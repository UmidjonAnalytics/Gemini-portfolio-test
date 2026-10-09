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

interface BlogPost {
  id: string;
  title: LocalizedString;
  excerpt: LocalizedString;
  content: LocalizedString;
  date: string;
  coverImage: string;
  url: string;
  order: number;
  published: boolean;
}

const defaultPost: Omit<BlogPost, 'id'> = {
  title: { en: '', ru: '', uz: '' },
  excerpt: { en: '', ru: '', uz: '' },
  content: { en: '', ru: '', uz: '' },
  date: new Date().toISOString().split('T')[0],
  coverImage: '',
  url: '',
  order: 0,
  published: true,
};

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<BlogPost | null>(null);
  const [activeLang, setActiveLang] = useState<'en' | 'ru' | 'uz'>('en');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'blog'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlogPost[];

      setPosts(data.sort((a, b) => a.order - b.order));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    const reordered = Array.from(posts);
    const [movedItem] = reordered.splice(sourceIndex, 1);
    reordered.splice(destinationIndex, 0, movedItem);

    setPosts(reordered);

    try {
      const batch = writeBatch(db);
      reordered.forEach((item, index) => {
        batch.update(doc(db, 'blog', item.id), { order: index });
      });
      await batch.commit();
    } catch (error) {
      toast.error("Failed to save new order");
    }
  };

  const handleAddNew = () => {
    const newId = `new_${Date.now()}`;
    setEditForm({ id: newId, ...defaultPost, order: posts.length });
    setEditingId(newId);
  };

  const handleSave = async () => {
    if (!editForm || !editForm.title.en) {
      toast.error("English title is required");
      return;
    }

    try {
      const isNew = editForm.id.startsWith('new_');
      const docId = isNew ? doc(collection(db, 'blog')).id : editForm.id;
      const { id, ...dataToSave } = editForm;

      await setDoc(doc(db, 'blog', docId), dataToSave);
      toast.success(isNew ? "Post added" : "Post updated");
      setEditingId(null);
      setEditForm(null);
    } catch (error) {
      toast.error("Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteDoc(doc(db, 'blog', id));
        toast.success("Post deleted");
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  const togglePublish = async (item: BlogPost) => {
    try {
      await setDoc(doc(db, 'blog', item.id), { published: !item.published }, { merge: true });
      toast.success(item.published ? "Hidden" : "Published");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <div className="animate-pulse bg-white dark:bg-gray-800 h-96 rounded-xl"></div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog</h1>
        <button
          onClick={handleAddNew}
          disabled={editingId !== null}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Post
        </button>
      </div>

      {!editingId && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="blog-list">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {posts.length === 0 && (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">No blog posts added yet.</p>
                  </div>
                )}

                {posts.map((item, index) => (
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

                        <div className="w-20 h-14 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden mr-4 flex-shrink-0 relative border dark:border-gray-600">
                          {item.coverImage ? (
                            <Image src={item.coverImage} alt="" fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No img</div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                              {item.title.en || 'Untitled Post'}
                            </h3>
                            {!item.published && <span className="ml-2 text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Draft</span>}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                            {item.date}
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
        <BlogEditor
          item={editForm} onChange={setEditForm} onSave={handleSave} onCancel={() => { setEditingId(null); setEditForm(null); }}
          activeLang={activeLang} setActiveLang={setActiveLang}
        />
      )}
    </div>
  );
}

function BlogEditor({ item, onChange, onSave, onCancel, activeLang, setActiveLang }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `blog/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      onChange({ ...item, coverImage: url });
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
          {item.id.startsWith('new_') ? 'Add Post' : 'Edit Post'}
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
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title ({activeLang}) *</label>
          <input
            type="text"
            value={item.title[activeLang]}
            onChange={(e) => onChange({ ...item, title: { ...item.title, [activeLang]: e.target.value } })}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
          <input
            type="date"
            value={item.date}
            onChange={(e) => onChange({ ...item, date: e.target.value })}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">External Link (optional)</label>
          <input
            type="url"
            value={item.url}
            onChange={(e) => onChange({ ...item, url: e.target.value })}
            placeholder="https://medium.com/..."
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Excerpt ({activeLang})</label>
          <textarea
            value={item.excerpt[activeLang]}
            onChange={(e) => onChange({ ...item, excerpt: { ...item.excerpt, [activeLang]: e.target.value } })}
            rows={2}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover Image (optional)</label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 flex flex-col items-center max-w-md">
          {item.coverImage ? (
            <div className="relative w-full aspect-video mb-4 rounded-lg overflow-hidden group border dark:border-gray-700">
              <img src={item.coverImage} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => onChange({ ...item, coverImage: '' })}
                className="absolute top-2 right-2 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="w-full aspect-video mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 border dark:border-gray-600">
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
        <button onClick={onSave} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Post</button>
      </div>
    </div>
  );
}
