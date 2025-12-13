
import React, { useState, useEffect } from 'react';
import { getAllManga, createManga, updateManga, deleteManga, uploadImage, MOCK_USER } from '../services/mockBackend';
import { Manga, User } from '../types';
import { LayoutDashboard, BookOpen, Plus, Trash2, Edit, UploadCloud, Save, X, Image as ImageIcon, Users, AlertCircle, Check } from 'lucide-react';
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

    // --- MODAL STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingManga, setEditingManga] = useState<Partial<Manga>>({});
    const [uploading, setUploading] = useState(false);

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
            rating: 0,
            tags: [],
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
        // Determine if update or create based on ID existence in list
        const exists = mangaList.some(m => m.id === editingManga.id);
        
        const payload = editingManga as Manga;
        // Ensure arrays are initialized
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

    return (
        <div className="min-h-screen bg-[#050505] pt-24 pb-20 px-4 animate-enter-up">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-white flex items-center gap-2">
                            <LayoutDashboard className="text-red-500" /> Admin Console
                        </h1>
                        <p className="text-gray-400">Moderation, Content Management & Uploads</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-2">
                        <button 
                            onClick={() => setActiveTab('dashboard')}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${activeTab === 'dashboard' ? 'bg-red-900/20 text-red-500 border border-red-500/30' : 'text-gray-400 hover:bg-[#111]'}`}
                        >
                            <LayoutDashboard size={20} /> Dashboard
                        </button>
                        <button 
                            onClick={() => setActiveTab('library')}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${activeTab === 'library' ? 'bg-red-900/20 text-red-500 border border-red-500/30' : 'text-gray-400 hover:bg-[#111]'}`}
                        >
                            <BookOpen size={20} /> Manga Library
                        </button>
                        <button 
                            onClick={() => setActiveTab('users')}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-red-900/20 text-red-500 border border-red-500/30' : 'text-gray-400 hover:bg-[#111]'}`}
                        >
                            <Users size={20} /> User Moderation
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        
                        {/* Dashboard Tab */}
                        {activeTab === 'dashboard' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
                                    <div className="text-gray-500 text-sm font-bold mb-1">TOTAL SERIES</div>
                                    <div className="text-3xl font-black text-white">{mangaList.length}</div>
                                </div>
                                <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
                                    <div className="text-gray-500 text-sm font-bold mb-1">TOTAL USERS</div>
                                    <div className="text-3xl font-black text-white">1,204</div>
                                </div>
                                <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
                                    <div className="text-gray-500 text-sm font-bold mb-1">PENDING REPORTS</div>
                                    <div className="text-3xl font-black text-red-500">3</div>
                                </div>
                                
                                <div className="md:col-span-3 bg-[#111] border border-white/5 rounded-2xl p-8 text-center border-dashed border-2 border-white/10">
                                    <AlertCircle className="mx-auto text-gray-500 mb-2" />
                                    <p className="text-gray-400">System Status: <span className="text-green-500 font-bold">Operational</span></p>
                                    <p className="text-xs text-gray-600">Last Database Sync: 2 minutes ago</p>
                                </div>
                            </div>
                        )}

                        {/* Library Tab */}
                        {activeTab === 'library' && (
                            <div className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden">
                                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                                    <h2 className="font-bold text-white">Managed Content</h2>
                                    <button onClick={handleCreate} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm">
                                        <Plus size={16} /> Add New Series
                                    </button>
                                </div>
                                
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-black/40 text-xs uppercase text-gray-500 font-bold">
                                            <tr>
                                                <th className="px-6 py-4">Title</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Stats</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {mangaList.map(manga => (
                                                <tr key={manga.id} className="hover:bg-white/5 transition">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-14 bg-gray-800 rounded overflow-hidden">
                                                                <img src={manga.coverUrl} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-white">{manga.title}</div>
                                                                <div className="text-xs text-gray-500">{manga.type}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${manga.status === 'Ongoing' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                                            {manga.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-400">
                                                        <div>{manga.views} views</div>
                                                        <div>{manga.chapters.length} chapters</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
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
                        
                        {/* Users Tab (Mock) */}
                        {activeTab === 'users' && (
                            <div className="bg-[#111] border border-white/5 rounded-3xl p-8 text-center">
                                <Users size={40} className="mx-auto text-gray-600 mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">User Moderation</h3>
                                <p className="text-gray-400 mb-6">User list and ban management is coming in v1.1</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CREATE/EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#161616] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#1a1a1a]">
                            <h3 className="text-xl font-bold text-white">
                                {editingManga.id && mangaList.some(m => m.id === editingManga.id) ? 'Edit Series' : 'New Series'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400 hover:text-white" /></button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Images */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cover Image (Vertical)</label>
                                    <div className="aspect-[3/4] bg-[#0a0a0a] rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center relative overflow-hidden group">
                                        {editingManga.coverUrl ? (
                                            <img src={editingManga.coverUrl} className="absolute inset-0 w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="text-gray-600 mb-2" />
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2">
                                                <UploadCloud size={14} /> Upload
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'coverUrl')} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Hero Image (Horizontal)</label>
                                    <div className="aspect-video bg-[#0a0a0a] rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center relative overflow-hidden group">
                                         {editingManga.heroUrl ? (
                                            <img src={editingManga.heroUrl} className="absolute inset-0 w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="text-gray-600 mb-2" />
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2">
                                                <UploadCloud size={14} /> Upload
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'heroUrl')} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Title</label>
                                    <input 
                                        value={editingManga.title || ''} 
                                        onChange={e => setEditingManga({...editingManga, title: e.target.value})}
                                        className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-red-500 focus:outline-none" 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-400 mb-1 block">Author</label>
                                        <input 
                                            value={editingManga.author || ''} 
                                            onChange={e => setEditingManga({...editingManga, author: e.target.value})}
                                            className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-red-500 focus:outline-none" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400 mb-1 block">Status</label>
                                        <select 
                                            value={editingManga.status || 'Ongoing'}
                                            onChange={e => setEditingManga({...editingManga, status: e.target.value as any})}
                                            className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-red-500 focus:outline-none"
                                        >
                                            <option value="Ongoing">Ongoing</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Hiatus">Hiatus</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Synopsis</label>
                                    <textarea 
                                        value={editingManga.synopsis || ''} 
                                        onChange={e => setEditingManga({...editingManga, synopsis: e.target.value})}
                                        className="w-full h-24 bg-black border border-white/10 rounded-lg p-3 text-white focus:border-red-500 focus:outline-none resize-none" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-[#1a1a1a]">
                            <button 
                                onClick={handleSave}
                                disabled={uploading}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                            >
                                {uploading ? 'Processing...' : <><Save size={18} /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
