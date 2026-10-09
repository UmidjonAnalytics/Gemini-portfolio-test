'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAppStore } from '@/store/useStore';
import { getDictionary, getLocalizedField } from '@/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub as Github } from 'react-icons/fa';
import { Search, LayoutGrid, List, X, ExternalLink, ChevronRight, ChevronLeft, ArrowRight, BarChart3, LineChart, PieChart } from 'lucide-react';
import Image from 'next/image';
import { BarChart, Bar, LineChart as RechartsLineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const { language } = useAppStore();
  const dict = getDictionary(language);

  const [activeTool, setActiveTool] = useState<string>('all');
  const [activeDomain, setActiveDomain] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest'|'impact'|'az'>('newest');
  const [viewMode, setViewMode] = useState<'grid'|'list'>('grid');

  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Chart states
  const [chartType, setChartType] = useState<'bar'|'line'|'area'>('bar');
  const [activeSeries, setActiveSeries] = useState<string>('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'projects'), (snap) => {
      const data = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((p: any) => p.published);
      setProjects(data);
    });
    return () => unsub();
  }, []);

  // Extract unique tools and domains
  const tools = ['all', ...Array.from(new Set(projects.flatMap(p => p.tools)))].filter(Boolean);
  const domains = ['all', ...Array.from(new Set(projects.map(p => p.domain)))].filter(Boolean);

  const filteredProjects = projects.filter(p => {
    const matchesTool = activeTool === 'all' || (p.tools && p.tools.includes(activeTool));
    const matchesDomain = activeDomain === 'all' || p.domain === activeDomain;

    const title = getLocalizedField(p.title, language)?.toLowerCase() || '';
    const summary = getLocalizedField(p.summary, language)?.toLowerCase() || '';
    const matchesSearch = title.includes(searchQuery.toLowerCase()) || summary.includes(searchQuery.toLowerCase());

    return matchesTool && matchesDomain && matchesSearch;
  }).sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;

    if (sortBy === 'newest') return a.order - b.order;
    if (sortBy === 'az') {
      const titleA = getLocalizedField(a.title, language) || '';
      const titleB = getLocalizedField(b.title, language) || '';
      return titleA.localeCompare(titleB);
    }
    // Mock impact sort (could use metrics count or a dedicated field)
    return b.tools?.length - a.tools?.length;
  });

  const navigateProject = (direction: number) => {
    const currentIndex = filteredProjects.findIndex(p => p.id === selectedProject?.id);
    if (currentIndex === -1) return;

    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = filteredProjects.length - 1;
    if (newIndex >= filteredProjects.length) newIndex = 0;

    setSelectedProject(filteredProjects[newIndex]);
  };

  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setSelectedProject(null);
        if (e.key === 'ArrowRight') navigateProject(1);
        if (e.key === 'ArrowLeft') navigateProject(-1);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'auto';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedProject, projects]); // eslint-disable-line react-hooks/exhaustive-deps

  if (projects.length === 0) return null;


  const renderChart = (jsonStr: string) => {
    if (!jsonStr) return null;
    try {
      const data = JSON.parse(jsonStr);
      if (!Array.isArray(data) || data.length === 0) return null;

      // Extract keys dynamically, excluding 'name'
      const dataKeys = Object.keys(data[0]).filter(k => k !== 'name');
      const seriesToRender = dataKeys.includes(activeSeries) ? activeSeries : dataKeys[0];

      return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-inner my-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-indigo-500" />
              {dict.projects.interactiveChart}
            </h4>

            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              {dataKeys.length > 1 && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Metric:</span>
                  <select
                    value={seriesToRender}
                    onChange={(e) => setActiveSeries(e.target.value)}
                    className="text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {dataKeys.map(key => (
                      <option key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                <button onClick={() => setChartType('bar')} className={`p-1.5 rounded-md ${chartType === 'bar' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}><BarChart3 size={16} /></button>
                <button onClick={() => setChartType('line')} className={`p-1.5 rounded-md ${chartType === 'line' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}><LineChart size={16} /></button>
                <button onClick={() => setChartType('area')} className={`p-1.5 rounded-md ${chartType === 'area' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}><PieChart size={16} /></button>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: 'rgba(99, 102, 241, 0.05)'}} />
                  <Bar dataKey={seriesToRender} fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              ) : chartType === 'line' ? (
                <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey={seriesToRender} stroke="#4f46e5" strokeWidth={3} dot={{r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                </RechartsLineChart>
              ) : (
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey={seriesToRender} stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      );
    } catch (e) {
      return null;
    }
  };

  return (
    <section id="projects" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            {dict.projects.title}
          </h2>
          <div className="w-16 h-1 bg-indigo-600 rounded-full mx-auto mt-4 mb-10"></div>

          {/* Filters & Controls */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 sm:p-6 mb-10 border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
              <div className="relative w-full lg:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={dict.projects.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-white dark:bg-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                />
              </div>

              <div className="flex items-center space-x-4 w-full lg:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="block w-full lg:w-48 pl-3 pr-10 py-2.5 text-base border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl bg-white dark:bg-gray-900"
                >
                  <option value="newest">{dict.projects.sortNewest}</option>
                  <option value="impact">{dict.projects.sortImpact}</option>
                  <option value="az">{dict.projects.sortAz}</option>
                </select>

                <div className="flex bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
                  <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                    <LayoutGrid size={18} />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Tools:</span>
                {tools.map(tool => (
                  <button
                    key={`tool-${tool}`}
                    onClick={() => setActiveTool(tool)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      activeTool === tool
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                        : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                    }`}
                  >
                    {tool === 'all' ? dict.projects.all : tool}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mt-3">
              <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Domain:</span>
                {domains.map(domain => (
                  <button
                    key={`domain-${domain}`}
                    onClick={() => setActiveDomain(domain)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      activeDomain === domain
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                        : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                  >
                    {domain === 'all' ? dict.projects.all : domain}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Project Grid/List */}
        <div className={viewMode === 'grid'
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          : "space-y-6"
        }>
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border ${project.featured ? 'border-indigo-500 shadow-indigo-100 dark:shadow-indigo-900/20' : 'border-gray-100 dark:border-gray-800'} shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${viewMode === 'list' ? 'flex flex-col sm:flex-row h-auto sm:h-64' : 'flex flex-col h-full'}`}
              >
                <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-full sm:w-2/5 h-48 sm:h-full' : 'w-full aspect-[4/3]'}`}>
                  {project.coverImage ? (
                    <Image src={project.coverImage} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                  {project.featured && (
                    <div className="absolute top-4 left-4 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      Featured
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <span className="text-white font-medium flex items-center">
                      {dict.projects.viewProject as any} <ArrowRight size={16} className="ml-2" />
                    </span>
                  </div>
                </div>

                <div className={`p-6 flex flex-col flex-1 ${viewMode === 'list' ? 'w-full sm:w-3/5 justify-center' : ''}`}>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-2.5 py-0.5 rounded-md">
                      {project.domain}
                    </span>
                    {project.tools?.slice(0, 3).map((tool: string) => (
                      <span key={tool} className="text-xs font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-2.5 py-0.5 rounded-md">
                        {tool}
                      </span>
                    ))}
                    {project.tools?.length > 3 && (
                      <span className="text-xs font-medium bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400 px-2.5 py-0.5 rounded-md">
                        +{project.tools.length - 3}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {getLocalizedField(project.title, language)}
                  </h3>

                  <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">
                    {getLocalizedField(project.summary, language)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Full Screen Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/90 backdrop-blur-sm p-4 sm:p-6"
            onClick={(e) => e.target === e.currentTarget && setSelectedProject(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 w-full max-w-6xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl relative"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white pr-8 truncate">
                  {getLocalizedField(selectedProject.title, language)}
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="hidden sm:flex space-x-2 mr-4 border-r border-gray-200 dark:border-gray-700 pr-4">
                    <button onClick={() => navigateProject(-1)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><ChevronLeft size={20} /></button>
                    <button onClick={() => navigateProject(1)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><ChevronRight size={20} /></button>
                  </div>
                  <button onClick={() => setSelectedProject(null)} className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto flex-1 p-6 sm:p-10 hide-scrollbar">

                {/* Hero Area */}
                <div className="flex flex-col lg:flex-row gap-10 mb-16">
                  <div className="w-full lg:w-1/2">
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800">
                      {selectedProject.coverImage ? (
                         <Image src={selectedProject.coverImage} alt="" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <BarChart3 className="w-20 h-20 text-gray-300 dark:text-gray-700" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-8">
                    <div>
                      <h3 className="text-sm uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold mb-2">Project Overview</h3>
                      <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                        {getLocalizedField(selectedProject.summary, language)}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">Domain</span>
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                          {selectedProject.domain}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">Tools & Technologies</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.tools?.map((tool: string) => (
                            <span key={tool} className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 pt-4">
                      {selectedProject.liveUrl && (
                        <a href={selectedProject.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-medium">
                          <ExternalLink size={18} className="mr-2" /> {dict.projects.viewLive as any}
                        </a>
                      )}
                      {selectedProject.githubUrl && (
                        <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center px-5 py-2.5 bg-gray-900 text-white dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl hover:bg-gray-800 transition-colors shadow-sm font-medium">
                          <Github size={18} className="mr-2" /> {dict.projects.viewGithub as any}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Case Study Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                  {getLocalizedField(selectedProject.problem, language) && (
                    <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/20">
                      <h4 className="text-lg font-bold text-red-800 dark:text-red-400 mb-3">{dict.projects.problem as any}</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {getLocalizedField(selectedProject.problem, language)}
                      </p>
                    </div>
                  )}
                  {getLocalizedField(selectedProject.approach, language) && (
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                      <h4 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-3">{dict.projects.approach as any}</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {getLocalizedField(selectedProject.approach, language)}
                      </p>
                    </div>
                  )}
                  {getLocalizedField(selectedProject.results, language) && (
                    <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-2xl border border-green-100 dark:border-green-900/20">
                      <h4 className="text-lg font-bold text-green-800 dark:text-green-400 mb-3">{dict.projects.results as any}</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {getLocalizedField(selectedProject.results, language)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Interactive Chart */}
                {selectedProject.chartJson && renderChart(selectedProject.chartJson)}

                {/* Iframe Embed */}
                {selectedProject.iframeUrl && (
                  <div className="mb-16">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                      <LayoutGrid className="w-6 h-6 mr-3 text-indigo-500" />
                      Live Dashboard
                    </h4>
                    <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                      <iframe
                        title="Dashboard"
                        src={selectedProject.iframeUrl}
                        className="w-full h-full"
                        frameBorder="0"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
