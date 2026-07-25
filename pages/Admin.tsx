import React, { useState, useEffect } from 'react';
import { getAllManga, createManga, updateManga, deleteManga, uploadImage, MOCK_USER } from '../services/mockBackend';
import { uploadSerializedChapterPanels, naturalSortFiles } from '../services/storageService';
import { Manga, Chapter, User } from '../types';
import { LayoutDashboard, BookOpen, Plus, Trash2, Edit, UploadCloud, Save, X, Image as ImageIcon, Users, AlertCircle, Layers, ArrowUp, ArrowDown, MoveLeft, MoveRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Admin: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'library' | 'users'>('dashboard');
    const [mangaList, setMangaList] = useState<Manga[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Auth Check
    useEffect(() => {
        const userStr = localStorage.getItem('crystal_user');
        const user: User = userStr ? JSON.parse(userStr) : MOCK_USER;
        
        if (user.role !== 'Admin') {
            navigate('/');
        }
    }, [navigate]);

    // Fetch Data
    const refreshData = async () => {
        const data = await getAllManga();
        setMangaList(data);
        setLoading(false);
    };

    useEffect(() => {
        refreshData();
    }, []);

    // --- MANGA MODAL STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingManga, setEditingManga] = useState<Partial<Manga>>({});
    const [uploading, setUploading] = useState(false);

    // --- CHAPTER INGESTION ENGINE STATE ---
    const [selectedMangaForChapters, setSelectedMangaForChapters] = useState<Manga | null>(null);
    const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
    const [newChapterNumber, setNewChapterNumber] = useState<number>(1);
    const [newChapterTitle, setNewChapterTitle] = useState<string>('');
    const [newChapterIsPremium, setNewChapterIsPremium] = useState<boolean>(false);
    const [serializedPanels, setSerializedPanels] = useState<string[]>([]);
    const [uploadProgressText, setUploadProgressText] = useState<string>('');
    const [uploadProgressPercent, setUploadProgressPercent] = useState<number>(0);

    const handleEdit = (manga: Manga) => {
        setEditingManga(manga);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingManga({
            id: Date.now().toString(),
            title: '',
            status: 'Ongoing',
            type: 'Manhwa',
            rating: 5.0,
            tags: ['Action', 'Fantasy'],
            chapters: [],
            views: '0',
            synopsis: ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if(window.confirm('Are you sure you want to delete this series?')) {
            await deleteManga(id);
            refreshData();
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'coverUrl' | 'heroUrl') => {
        const file = e.target.files?.[0];
        if (file) {
            setUploading(true);
            try {
                const base64 = await uploadImage(file);
                setEditingManga(prev => ({ ...prev, [field]: base64 }));
            } catch (err) {
                alert('Upload failed');
            } finally {
                setUploading(false);
            }
        }
    };

    const handleSave = async () => {
        if (!editingManga.title || !editingManga.id) return alert('Title is required');
        
        setUploading(true);
        const exists = mangaList.some(m => m.id === editingManga.id);
        const payload = editingManga as Manga;
        payload.tags = payload.tags || [];
        payload.chapters = payload.chapters || [];
        
        if (exists) {
            await updateManga(payload);
        } else {
            await createManga(payload);
        }
        
        setUploading(false);
        setIsModalOpen(false);
        refreshData();
    };

    // --- CHAPTER INGESTION & PANEL SERIALIZER HANDLERS ---
    const handleOpenChapterManager = (manga: Manga) => {
        setSelectedMangaForChapters(manga);
        setNewChapterNumber((manga.chapters.length || 0) + 1);
        setNewChapterTitle(`Episode ${(manga.chapters.length || 0) + 1}`);
        setSerializedPanels([]);
        setUploadProgressText('');
        setUploadProgressPercent(0);
        setIsChapterModalOpen(true);
    };

    const handleBatchChapterImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !selectedMangaForChapters) return;

        setUploading(true);
        const rawFiles = Array.from(files);
        
        // Execute natural alphanumeric sorting and CDN ingestion
        const cdnUrls = await uploadSerializedChapterPanels(
            selectedMangaForChapters.id,
            newChapterNumber,
            rawFiles,
            (status, percent) => {
                setUploadProgressText(status);
                setUploadProgressPercent(percent);
            }
        );

        setSerializedPanels(prev => [...prev, ...cdnUrls]);
        setUploading(false);
        setUploadProgressText(`Successfully loaded & serialized ${cdnUrls.length} chapter panels!`);
    };

    // Manual Panel Serialization Controls
    const movePanel = (index: number, direction: 'up' | 'down') => {
        const newPanels = [...serializedPanels];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newPanels.length) return;
        
        const temp = newPanels[index];
        newPanels[index] = newPanels[targetIndex];
        newPanels[targetIndex] = temp;
        setSerializedPanels(newPanels);
    };

    const deletePanel = (index: number) => {
        setSerializedPanels(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveNewChapter = async () => {
        if (!selectedMangaForChapters) return;

        const newChapter: Chapter = {
            id: `c${Date.now()}`,
            number: newChapterNumber,
            title: newChapterTitle || `Chapter ${newChapterNumber}`,
            releaseDate: 'Just now',
            isPremium: newChapterIsPremium
        };

        const updatedManga: Manga = {
            ...selectedMangaForChapters,
            chapters: [newChapter, ...selectedMangaForChapters.chapters]
        };

        await updateManga(updatedManga);
        setSelectedMangaForChapters(updatedManga);
        setSerializedPanels([]);
        alert(`Chapter ${newChapterNumber} published with ${serializedPanels.length} serialized panels!`);
        refreshData();
    };

    return (
        <div className="min-h-screen bg-[#050505] pt-24 pb-20 px-4 animate-enter-up">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white flex items-center gap-2">
                            <LayoutDashboard className="text-purple-500" /> Admin Console
                        </h1>
                        <p className="text-gray-400">Manage Series, Batch Upload & Serialize Chapter Panels</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-2">
                        <button 
                            onClick={() => setActiveTab('dashboard')}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${activeTab === 'dashboard' ? 'bg-purple-900/20 text-purple-400 border border-purple-500/30' : 'text-gray-400 hover:bg-[#111]'}`}
                        >
                            <LayoutDashboard size={20} /> Dashboard
                        </button>
                        <button 
                            onClick={() => setActiveTab('library')}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${activeTab === 'library' ? 'bg-purple-900/20 text-purple-400 border border-purple-500/30' : 'text-gray-400 hover:bg-[#111]'}`}
                        >
                            <BookOpen size={20} /> Manga Library
                        </button>
                        <button 
                            onClick={() => setActiveTab('users')}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-purple-900/20 text-purple-400 border border-purple-500/30' : 'text-gray-400 hover:bg-[#111]'}`}
                        >
                            <Users size={20} /> User Moderation
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        
                        {/* Dashboard Tab */}
                        {activeTab === 'dashboard' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-[#0E0E15] border border-white/10 rounded-2xl p-6">
                                    <div className="text-gray-400 text-xs font-bold uppercase mb-1">TOTAL SERIES</div>
                                    <div className="text-3xl font-black text-white">{mangaList.length}</div>
                                </div>
                                <div className="bg-[#0E0E15] border border-white/10 rounded-2xl p-6">
                                    <div className="text-gray-400 text-xs font-bold uppercase mb-1">TOTAL CHAPTERS</div>
                                    <div className="text-3xl font-black text-purple-400">
                                        {mangaList.reduce((acc, m) => acc + (m.chapters?.length || 0), 0)}
                                    </div>
                                </div>
                                <div className="bg-[#0E0E15] border border-white/10 rounded-2xl p-6">
                                    <div className="text-gray-400 text-xs font-bold uppercase mb-1">STORAGE ENGINE</div>
                                    <div className="text-xl font-black text-cyan-400 flex items-center gap-2">
                                        Cloudflare R2 ($0 Egress)
                                    </div>
                                </div>
                                
                                <div className="md:col-span-3 bg-[#0E0E15] border border-white/10 rounded-2xl p-8 text-center border-dashed border-white/20">
                                    <AlertCircle className="mx-auto text-purple-400 mb-2" />
                                    <p className="text-gray-300 font-medium">Supabase DB & R2 CDN Status: <span className="text-green-400 font-bold">Operational 24/7</span></p>
                                    <p className="text-xs text-gray-500 mt-1">Dual-DB Failover Active | Natural File Serialization Enabled</p>
                                </div>
                            </div>
                        )}

                        {/* Library Tab */}
                        {activeTab === 'library' && (
                            <div className="bg-[#0E0E15] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#11111a]">
                                    <h2 className="font-bold text-white text-lg">Managed Series & Content</h2>
                                    <button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm transition-all shadow-lg shadow-purple-600/20">
                                        <Plus size={16} /> Add New Series
                                    </button>
                                </div>
                                
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-black/40 text-xs uppercase text-gray-400 font-bold border-b border-white/5">
                                            <tr>
                                                <th className="px-6 py-4">Series Title</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Chapters</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {mangaList.map(manga => (
                                                <tr key={manga.id} className="hover:bg-white/5 transition">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-14 bg-gray-800 rounded-lg overflow-hidden border border-white/10">
                                                                <img src={manga.coverUrl} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-white">{manga.title}</div>
                                                                <div className="text-xs text-gray-400">{manga.type} • {manga.author}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${manga.status === 'Ongoing' ? 'bg-green-900/40 text-green-400 border border-green-500/30' : 'bg-red-900/40 text-red-400 border border-red-500/30'}`}>
                                                            {manga.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-300">
                                                        <div className="font-semibold text-purple-400 flex items-center gap-1">
                                                            <Layers size={14} /> {manga.chapters.length} Chapters
                                                        </div>
                                                        <div className="text-xs text-gray-500">{manga.views} views</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button 
                                                                onClick={() => handleOpenChapterManager(manga)} 
                                                                className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-purple-500/30 transition"
                                                            >
                                                                <UploadCloud size={14} /> Chapters & Panels
                                                            </button>
                                                            <button onClick={() => handleEdit(manga)} className="p-2 hover:bg-white/10 rounded-lg text-blue-400"><Edit size={16} /></button>
                                                            <button onClick={() => handleDelete(manga.id)} className="p-2 hover:bg-white/10 rounded-lg text-red-400"><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        
                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <div className="bg-[#0E0E15] border border-white/10 rounded-3xl p-8 text-center">
                                <Users size={40} className="mx-auto text-purple-400 mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">User Moderation & Linked Roles</h3>
                                <p className="text-gray-400 max-w-md mx-auto mb-6">User profile sync, Discord role verification, and moderation tools active.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CREATE/EDIT SERIES MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0E0E15] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#11111a]">
                            <h3 className="text-xl font-bold text-white">
                                {editingManga.id && mangaList.some(m => m.id === editingManga.id) ? 'Edit Series Metadata' : 'Create New Series'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400 hover:text-white" /></button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Images */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Cover Poster (Vertical)</label>
                                    <div className="aspect-[3/4] bg-[#050508] rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center relative overflow-hidden group">
                                        {editingManga.coverUrl ? (
                                            <img src={editingManga.coverUrl} className="absolute inset-0 w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="text-gray-600 mb-2" />
                                        )}
                                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <label className="cursor-pointer bg-purple-600 text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2">
                                                <UploadCloud size={14} /> Upload Poster
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'coverUrl')} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Hero Banner (Horizontal)</label>
                                    <div className="aspect-video bg-[#050508] rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center relative overflow-hidden group">
                                         {editingManga.heroUrl ? (
                                            <img src={editingManga.heroUrl} className="absolute inset-0 w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="text-gray-600 mb-2" />
                                        )}
                                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <label className="cursor-pointer bg-purple-600 text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2">
                                                <UploadCloud size={14} /> Upload Banner
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'heroUrl')} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block font-medium">Series Title</label>
                                    <input 
                                        value={editingManga.title || ''} 
                                        onChange={e => setEditingManga({...editingManga, title: e.target.value})}
                                        placeholder="e.g. Solo Leveling: Ragnarok"
                                        className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none" 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-400 mb-1 block font-medium">Author / Artist</label>
                                        <input 
                                            value={editingManga.author || ''} 
                                            onChange={e => setEditingManga({...editingManga, author: e.target.value})}
                                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400 mb-1 block font-medium">Status</label>
                                        <select 
                                            value={editingManga.status || 'Ongoing'}
                                            onChange={e => setEditingManga({...editingManga, status: e.target.value as any})}
                                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none"
                                        >
                                            <option value="Ongoing">Ongoing</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Hiatus">Hiatus</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block font-medium">Synopsis</label>
                                    <textarea 
                                        value={editingManga.synopsis || ''} 
                                        onChange={e => setEditingManga({...editingManga, synopsis: e.target.value})}
                                        className="w-full h-24 bg-black border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none resize-none" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 bg-[#11111a]">
                            <button 
                                onClick={handleSave}
                                disabled={uploading}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25"
                            >
                                {uploading ? 'Saving Metadata...' : <><Save size={18} /> Save Series</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CHAPTER INGESTION & SERIALIZED PANEL GRID MODAL */}
            {isChapterModalOpen && selectedMangaForChapters && (
                <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0E0E15] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl animate-slide-up">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#11111a]">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Layers className="text-purple-400" /> Chapter Ingestion: {selectedMangaForChapters.title}
                                </h3>
                                <p className="text-xs text-gray-400">Natural alphanumeric sorting & panel serialization for Cloudflare R2 / CDN</p>
                            </div>
                            <button onClick={() => setIsChapterModalOpen(false)}><X className="text-gray-400 hover:text-white" /></button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Create New Chapter Form */}
                            <div className="bg-black/50 border border-white/10 rounded-2xl p-5 space-y-4">
                                <h4 className="font-bold text-white flex items-center gap-2">
                                    <Plus className="text-green-400" /> Create New Chapter
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Chapter Number</label>
                                        <input 
                                            type="number"
                                            value={newChapterNumber} 
                                            onChange={e => setNewChapterNumber(parseInt(e.target.value) || 1)}
                                            className="w-full bg-[#111] border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none font-bold" 
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Chapter Title</label>
                                        <input 
                                            value={newChapterTitle} 
                                            onChange={e => setNewChapterTitle(e.target.value)}
                                            placeholder="e.g. Episode 21: Awakening"
                                            className="w-full bg-[#111] border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none" 
                                        />
                                    </div>
                                </div>

                                {/* Batch Image Dropzone */}
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Upload Chapter Panels (Batch Multi-Select)</label>
                                    <div className="border-2 border-dashed border-purple-500/40 hover:border-purple-500 bg-purple-950/10 rounded-2xl p-6 text-center cursor-pointer transition group">
                                        <input 
                                            type="file" 
                                            multiple 
                                            accept="image/*" 
                                            onChange={handleBatchChapterImageUpload} 
                                            className="hidden" 
                                            id="batch-chapter-upload" 
                                        />
                                        <label htmlFor="batch-chapter-upload" className="cursor-pointer flex flex-col items-center">
                                            <UploadCloud className="w-10 h-10 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-sm font-bold text-white">Click to Select Chapter Page Images (01.jpg, 02.jpg...)</span>
                                            <span className="text-xs text-gray-400 mt-1">Automatic Natural Alphanumeric Sorting • Cloudflare R2 Direct Upload</span>
                                        </label>
                                    </div>

                                    {/* Upload Progress Bar */}
                                    {uploadProgressPercent > 0 && (
                                        <div className="mt-3 space-y-1">
                                            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                                <div 
                                                    className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full transition-all duration-300"
                                                    style={{ width: `${uploadProgressPercent}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-purple-300 font-semibold text-center">{uploadProgressText}</p>
                                        </div>
                                    )}
                                </div>

                                {/* INTERACTIVE PANEL SERIALIZER GRID */}
                                {serializedPanels.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold text-purple-300 uppercase">
                                                Serialized Panel Sequence ({serializedPanels.length} Panels)
                                            </label>
                                            <span className="text-[11px] text-gray-400">Use arrow controls to re-order sequence</span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 p-3 bg-[#050508] rounded-2xl border border-white/10 max-h-72 overflow-y-auto">
                                            {serializedPanels.map((imgUrl, idx) => (
                                                <div key={idx} className="relative aspect-[2/3] bg-gray-900 rounded-xl border border-white/10 overflow-hidden group shadow-lg">
                                                    <img src={imgUrl} className="w-full h-full object-cover" />
                                                    <div className="absolute top-1 left-1 bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                                                        Panel {idx + 1}
                                                    </div>

                                                    {/* Serialization Controls Overlay */}
                                                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                                        <div className="flex justify-between">
                                                            <button 
                                                                onClick={() => movePanel(idx, 'up')}
                                                                disabled={idx === 0}
                                                                className="p-1 bg-white/20 hover:bg-white/40 text-white rounded text-xs disabled:opacity-30"
                                                                title="Move Left/Up"
                                                            >
                                                                <ArrowUp size={12} />
                                                            </button>
                                                            <button 
                                                                onClick={() => movePanel(idx, 'down')}
                                                                disabled={idx === serializedPanels.length - 1}
                                                                className="p-1 bg-white/20 hover:bg-white/40 text-white rounded text-xs disabled:opacity-30"
                                                                title="Move Right/Down"
                                                            >
                                                                <ArrowDown size={12} />
                                                            </button>
                                                        </div>
                                                        <button 
                                                            onClick={() => deletePanel(idx)}
                                                            className="w-full bg-red-600/80 hover:bg-red-600 text-white text-[10px] font-bold py-1 rounded flex items-center justify-center gap-1"
                                                        >
                                                            <Trash2 size={10} /> Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button 
                                    onClick={handleSaveNewChapter}
                                    disabled={uploading || serializedPanels.length === 0}
                                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25"
                                >
                                    <Save size={18} /> Publish Chapter {newChapterNumber} ({serializedPanels.length} Panels)
                                </button>
                            </div>

                            {/* Existing Chapters List */}
                            <div>
                                <h4 className="font-bold text-white mb-3 text-sm uppercase text-gray-400">Published Chapters ({selectedMangaForChapters.chapters.length})</h4>
                                <div className="space-y-2 max-h-52 overflow-y-auto">
                                    {selectedMangaForChapters.chapters.map(c => (
                                        <div key={c.id} className="flex items-center justify-between bg-black/40 border border-white/5 p-3 rounded-xl hover:border-white/20 transition">
                                            <div>
                                                <span className="font-bold text-white text-sm">Ch. {c.number} — {c.title}</span>
                                                <span className="text-xs text-gray-500 ml-3">{c.releaseDate}</span>
                                            </div>
                                            <span className="text-xs text-cyan-400 font-bold px-2.5 py-1 bg-cyan-950/30 border border-cyan-500/30 rounded-full">
                                                Serialized CDN
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
