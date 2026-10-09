'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, doc, writeBatch, deleteDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Plus, GripVertical, Trash2, Edit2, Loader2, Eye, EyeOff, Upload, X, Star } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import Image from 'next/image';

type LocalizedString = { en: string; ru: string; uz: string };

interface Project {
  id: string;
  title: LocalizedString;
  summary: LocalizedString;
  problem: LocalizedString;
  approach: LocalizedString;
  results: LocalizedString;
  tools: string[];
  domain: string;
  coverImage: string;
  gallery: string[];
  githubUrl: string;
  liveUrl: string;
  iframeUrl: string;
  chartJson: string;
  metrics: { label: LocalizedString; value: string }[];
  featured: boolean;
  order: number;
  published: boolean;
}

const defaultProject: Omit<Project, 'id'> = {
  title: { en: '', ru: '', uz: '' },
  summary: { en: '', ru: '', uz: '' },
  problem: { en: '', ru: '', uz: '' },
  approach: { en: '', ru: '', uz: '' },
  results: { en: '', ru: '', uz: '' },
  tools: [],
  domain: 'Finance',
  coverImage: '',
  gallery: [],
  githubUrl: '',
  liveUrl: '',
  iframeUrl: '',
  chartJson: '',
  metrics: [],
  featured: false,
  order: 0,
  published: true,
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Project | null>(null);
  const [activeLang, setActiveLang] = useState<'en' | 'ru' | 'uz'>('en');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'projects'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];

      setProjects(data.sort((a, b) => a.order - b.order));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const reordered = Array.from(projects);
    const [movedItem] = reordered.splice(sourceIndex, 1);
    reordered.splice(destinationIndex, 0, movedItem);

    setProjects(reordered);

    try {
      const batch = writeBatch(db);
      reordered.forEach((item, index) => {
        const docRef = doc(db, 'projects', item.id);
        batch.update(docRef, { order: index });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error reordering", error);
      toast.error("Failed to save new order");
    }
  };

  const handleAddNew = () => {
    const newId = `new_${Date.now()}`;
    setEditForm({ id: newId, ...defaultProject, order: projects.length });
    setEditingId(newId);
  };

  const handleSave = async () => {
    if (!editForm || !editForm.title.en) {
      toast.error("English title is required");
      return;
    }

    try {
      const isNew = editForm.id.startsWith('new_');
      const docId = isNew ? doc(collection(db, 'projects')).id : editForm.id;

      const { id, ...dataToSave } = editForm;

      await setDoc(doc(db, 'projects', docId), dataToSave);
      toast.success(isNew ? "Project added" : "Project updated");
      setEditingId(null);
      setEditForm(null);
    } catch (error) {
      console.error("Error saving", error);
      toast.error("Failed to save project");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteDoc(doc(db, 'projects', id));
        toast.success("Project deleted");
      } catch (error) {
        console.error("Error deleting", error);
        toast.error("Failed to delete project");
      }
    }
  };

  const togglePublish = async (project: Project) => {
    try {
      await setDoc(doc(db, 'projects', project.id), { published: !project.published }, { merge: true });
      toast.success(project.published ? "Hidden" : "Published");
    } catch (error) {
      console.error("Error toggling", error);
      toast.error("Failed to update status");
    }
  };

  const toggleFeatured = async (project: Project) => {
    try {
      await setDoc(doc(db, 'projects', project.id), { featured: !project.featured }, { merge: true });
      toast.success(project.featured ? "Removed from featured" : "Marked as featured");
    } catch (error) {
      console.error("Error toggling", error);
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-white dark:bg-gray-800 h-96 rounded-xl"></div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
        <button
          onClick={handleAddNew}
          disabled={editingId !== null}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Project
        </button>
      </div>

      {!editingId && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="projects-list">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {projects.length === 0 && (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">No projects added yet.</p>
                  </div>
                )}

                {projects.map((project, index) => (
                  <Draggable key={project.id} draggableId={project.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-white dark:bg-gray-800 rounded-xl border ${project.published ? 'border-gray-100 dark:border-gray-700' : 'border-dashed border-gray-300 dark:border-gray-600 opacity-75'} p-4 flex items-center ${snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500 z-50' : 'shadow-sm'}`}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="p-2 mr-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical size={20} />
                        </div>

                        <div className="w-20 h-14 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden mr-4 flex-shrink-0 relative">
                          {project.coverImage ? (
                            <Image src={project.coverImage} alt="" fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">No img</div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                              {project.title.en || 'Untitled Project'}
                            </h3>
                            {!project.published && <span className="ml-2 text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Draft</span>}
                            {project.featured && <span className="ml-2 text-xs font-normal text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center"><Star size={12} className="mr-1" /> Featured</span>}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                            {project.domain} • {project.tools.slice(0, 3).join(', ')}{project.tools.length > 3 ? '...' : ''}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                          <button
                            onClick={() => toggleFeatured(project)}
                            className={`p-2 rounded-lg transition-colors ${project.featured ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'}`}
                            title="Toggle Featured"
                          >
                            <Star size={18} className={project.featured ? "fill-current" : ""} />
                          </button>
                          <button
                            onClick={() => togglePublish(project)}
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                            title={project.published ? "Unpublish" : "Publish"}
                          >
                            {project.published ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                          <button
                            onClick={() => { setEditForm(project); setEditingId(project.id); }}
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
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
        <ProjectEditor
          project={editForm}
          onChange={setEditForm}
          onSave={handleSave}
          onCancel={() => { setEditingId(null); setEditForm(null); }}
          activeLang={activeLang}
          setActiveLang={setActiveLang}
        />
      )}
    </div>
  );
}

function ProjectEditor({
  project,
  onChange,
  onSave,
  onCancel,
  activeLang,
  setActiveLang
}: {
  project: Project;
  onChange: (p: Project) => void;
  onSave: () => void;
  onCancel: () => void;
  activeLang: 'en' | 'ru' | 'uz';
  setActiveLang: (lang: 'en' | 'ru' | 'uz') => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const toolsInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `projects/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      onChange({ ...project, coverImage: url });
      toast.success("Image uploaded");
    } catch (error) {
      console.error("Error uploading", error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAddTool = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && toolsInputRef.current?.value) {
      e.preventDefault();
      const newTool = toolsInputRef.current.value.trim();
      if (newTool && !project.tools.includes(newTool)) {
        onChange({ ...project, tools: [...project.tools, newTool] });
      }
      toolsInputRef.current.value = '';
    }
  };

  const removeTool = (tool: string) => {
    onChange({ ...project, tools: project.tools.filter(t => t !== tool) });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {project.id.startsWith('new_') ? 'New Project' : 'Edit Project'}
        </h2>
        <div className="flex space-x-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">Cancel</button>
          <button onClick={onSave} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Project</button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white">Content</h3>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {(['en', 'ru', 'uz'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      activeLang === lang ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title ({activeLang}) *</label>
                <input
                  type="text"
                  value={project.title[activeLang]}
                  onChange={(e) => onChange({ ...project, title: { ...project.title, [activeLang]: e.target.value } })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                  placeholder="e.g. Sales Dashboard"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">One-line Summary ({activeLang})</label>
                <input
                  type="text"
                  value={project.summary[activeLang]}
                  onChange={(e) => onChange({ ...project, summary: { ...project.summary, [activeLang]: e.target.value } })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">The Problem ({activeLang})</label>
                <textarea
                  value={project.problem[activeLang]}
                  onChange={(e) => onChange({ ...project, problem: { ...project.problem, [activeLang]: e.target.value } })}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">The Approach ({activeLang})</label>
                <textarea
                  value={project.approach[activeLang]}
                  onChange={(e) => onChange({ ...project, approach: { ...project.approach, [activeLang]: e.target.value } })}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">The Results ({activeLang})</label>
                <textarea
                  value={project.results[activeLang]}
                  onChange={(e) => onChange({ ...project, results: { ...project.results, [activeLang]: e.target.value } })}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interactive Chart JSON Data (optional)</label>
                <textarea
                  value={project.chartJson}
                  onChange={(e) => onChange({ ...project, chartJson: e.target.value })}
                  rows={4}
                  placeholder='[{"name": "Jan", "value": 400}, {"name": "Feb", "value": 300}]'
                  className="w-full font-mono text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover Image</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 flex flex-col items-center">
                {project.coverImage ? (
                  <div className="relative w-full aspect-video mb-4 rounded-lg overflow-hidden group">
                    <img src={project.coverImage} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => onChange({ ...project, coverImage: '' })}
                      className="absolute top-2 right-2 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="w-full aspect-video mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
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

            {/* Metadata */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Domain / Category</label>
                <select
                  value={project.domain}
                  onChange={(e) => onChange({ ...project, domain: e.target.value })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                >
                  <option value="Finance">Finance</option>
                  <option value="Retail">Retail</option>
                  <option value="HR">HR</option>
                  <option value="Education">Education</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tools Used (Press Enter to add)</label>
                <input
                  type="text"
                  ref={toolsInputRef}
                  onKeyDown={handleAddTool}
                  placeholder="e.g. Python, SQL"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white mb-2"
                />
                <div className="flex flex-wrap gap-2">
                  {project.tools.map(tool => (
                    <span key={tool} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                      {tool}
                      <button onClick={() => removeTool(tool)} className="ml-1.5 text-indigo-500 hover:text-indigo-700">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Live URL (optional)</label>
                <input
                  type="url"
                  value={project.liveUrl}
                  onChange={(e) => onChange({ ...project, liveUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GitHub URL (optional)</label>
                <input
                  type="url"
                  value={project.githubUrl}
                  onChange={(e) => onChange({ ...project, githubUrl: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dashboard Iframe Embed URL (optional)</label>
                <input
                  type="url"
                  value={project.iframeUrl}
                  onChange={(e) => onChange({ ...project, iframeUrl: e.target.value })}
                  placeholder="https://app.powerbi.com/view?..."
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
