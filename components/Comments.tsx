import React, { useState, useEffect } from 'react';
import { getComments, addComment, getUser, reactToComment } from '../services/mockBackend';
import { Comment, User } from '../types';
import { MessageSquare, ThumbsUp, Send, Bold, Italic, Strikethrough, EyeOff, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CommentsProps {
    mangaId: string;
}

// Emoji Reaction definition matching AsuraScans
interface ReactionOption {
    emoji: string;
    label: string;
}

const REACTION_OPTIONS: ReactionOption[] = [
    { emoji: '👍', label: 'Upvote' },
    { emoji: '😂', label: 'Funny' },
    { emoji: '❤️', label: 'Love' },
    { emoji: '😮', label: 'Surprised' },
    { emoji: '😠', label: 'Angry' },
    { emoji: '😢', label: 'Sad' },
];

/**
 * Text formatter to render markdown bold, italic, strikethrough, and [spoiler] masks
 */
const FormattedCommentContent: React.FC<{ content: string }> = ({ content }) => {
    // Regex splits by [spoiler]...[/spoiler]
    const parts = content.split(/(\[spoiler\].*?\[\/spoiler\])/gi);

    return (
        <span className="leading-relaxed">
            {parts.map((part, i) => {
                const spoilerMatch = part.match(/\[spoiler\](.*?)\[\/spoiler\]/i);
                if (spoilerMatch) {
                    return <SpoilerText key={i} text={spoilerMatch[1]} />;
                }
                return <span key={i}>{part}</span>;
            })}
        </span>
    );
};

const SpoilerText: React.FC<{ text: string }> = ({ text }) => {
    const [revealed, setRevealed] = useState(false);
    return (
        <span 
            onClick={() => setRevealed(!revealed)}
            className={`inline-block px-1.5 py-0.5 mx-0.5 rounded text-xs transition-all cursor-pointer ${
                revealed 
                ? 'bg-zinc-700/80 text-white blur-none' 
                : 'bg-zinc-800 text-zinc-500 blur-sm select-none hover:blur-[2px]'
            }`}
            title="Click to toggle spoiler reveal"
        >
            {text}
        </span>
    );
};

const Comments: React.FC<CommentsProps> = ({ mangaId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [sortBy, setSortBy] = useState<'best' | 'new' | 'old'>('best');

    // Chapter-level Reaction Matrix
    const [chapterReactions, setChapterReactions] = useState<Record<string, number>>({
        '👍': 42,
        '😂': 15,
        '❤️': 38,
        '😮': 9,
        '😠': 3,
        '😢': 1
    });
    const [userSelectedReaction, setUserSelectedReaction] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [fetchedComments, fetchedUser] = await Promise.all([
                getComments(mangaId),
                getUser()
            ]);
            setComments(fetchedComments);
            setUser(fetchedUser);

            // Load saved user reaction
            const savedReaction = localStorage.getItem(`crystal_reaction_${mangaId}`);
            if (savedReaction) {
                setUserSelectedReaction(savedReaction);
            }

            setLoading(false);
        };
        fetchData();
    }, [mangaId]);

    const handleReactionClick = (emoji: string) => {
        setChapterReactions(prev => {
            const next = { ...prev };
            if (userSelectedReaction === emoji) {
                // Deselect
                next[emoji] = Math.max(0, next[emoji] - 1);
                setUserSelectedReaction(null);
                localStorage.removeItem(`crystal_reaction_${mangaId}`);
            } else {
                if (userSelectedReaction && next[userSelectedReaction]) {
                    next[userSelectedReaction] = Math.max(0, next[userSelectedReaction] - 1);
                }
                next[emoji] = (next[emoji] || 0) + 1;
                setUserSelectedReaction(emoji);
                localStorage.setItem(`crystal_reaction_${mangaId}`, emoji);
            }
            return next;
        });
    };

    const handleInsertFormat = (tag: 'bold' | 'italic' | 'strike' | 'spoiler') => {
        if (tag === 'bold') setNewComment(prev => prev + '**bold text**');
        if (tag === 'italic') setNewComment(prev => prev + '*italic text*');
        if (tag === 'strike') setNewComment(prev => prev + '~~strikethrough~~');
        if (tag === 'spoiler') setNewComment(prev => prev + '[spoiler]hidden spoiler text[/spoiler]');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        setSubmitting(true);
        try {
            const addedComment = await addComment(mangaId, newComment);
            setComments([addedComment, ...comments]);
            setNewComment('');
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleLikeComment = (commentId: string) => {
        setComments(prev => prev.map(c => {
            if (c.id === commentId) {
                return { ...c, likes: c.likes + 1 };
            }
            return c;
        }));
    };

    // Sort comments
    const sortedComments = [...comments].sort((a, b) => {
        if (sortBy === 'best') return b.likes - a.likes;
        if (sortBy === 'new') return parseInt(b.id, 10) - parseInt(a.id, 10);
        return parseInt(a.id, 10) - parseInt(b.id, 10);
    });

    const totalReactions = Object.values(chapterReactions).reduce((acc, curr) => acc + curr, 0);

    return (
        <div id="comments-section" className="mt-12 max-w-4xl mx-auto w-full">
            {/* ASURA-STYLE CHAPTER EMOJI REACTIONS MATRIX */}
            <div className="bg-[#0E0E15] border border-white/10 rounded-2xl p-6 mb-8 shadow-xl">
                <div className="text-center mb-6">
                    <h3 className="text-base font-semibold text-white">What did you think of this chapter?</h3>
                    <p className="text-xs text-gray-400 mt-1">{totalReactions} reader reactions recorded</p>
                </div>

                <div className="grid grid-cols-3 sm:flex sm:justify-center sm:gap-6 gap-3">
                    {REACTION_OPTIONS.map(({ emoji, label }) => {
                        const count = chapterReactions[emoji] || 0;
                        const isSelected = userSelectedReaction === emoji;
                        return (
                            <button
                                key={emoji}
                                type="button"
                                onClick={() => handleReactionClick(emoji)}
                                className={`flex flex-col items-center p-3 rounded-xl transition-all cursor-pointer border ${
                                    isSelected 
                                    ? 'bg-purple-600/20 border-purple-500 scale-105' 
                                    : 'bg-black/30 border-white/5 hover:border-white/20 hover:scale-105'
                                }`}
                            >
                                <span className="text-3xl mb-1 filter drop-shadow">{emoji}</span>
                                <span className={`text-sm font-bold ${isSelected ? 'text-purple-300' : 'text-gray-200'}`}>
                                    {count}
                                </span>
                                <span className="text-[11px] text-gray-400">{label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* HEADER & SORTING TABS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <MessageSquare className="text-purple-500" /> Discussion
                    <span className="text-xs font-bold text-purple-400 bg-purple-950/60 border border-purple-500/20 px-3 py-1 rounded-full">
                        {comments.length} Comments
                    </span>
                </h3>

                <div className="flex items-center bg-[#0E0E15] border border-white/10 rounded-xl p-1 text-xs">
                    <button 
                        onClick={() => setSortBy('best')}
                        className={`px-4 py-1.5 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                            sortBy === 'best' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Best
                    </button>
                    <button 
                        onClick={() => setSortBy('new')}
                        className={`px-4 py-1.5 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                            sortBy === 'new' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        New
                    </button>
                    <button 
                        onClick={() => setSortBy('old')}
                        className={`px-4 py-1.5 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                            sortBy === 'old' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Old
                    </button>
                </div>
            </div>

            {/* RICH TEXT COMMENT COMPOSER */}
            <div className="bg-[#0E0E15] border border-white/10 rounded-2xl p-5 mb-8 shadow-xl">
                {user ? (
                    <form onSubmit={handleSubmit} className="flex gap-4">
                        <img src={user.avatarUrl} className="w-10 h-10 rounded-full border border-white/10 flex-shrink-0" alt="User" />
                        <div className="flex-1">
                            <textarea 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Join the discussion... (Supports [spoiler]hidden[/spoiler])"
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-purple-500 focus:outline-none resize-none h-24 mb-2"
                            />

                            {/* Formatting Toolbar */}
                            <div className="flex items-center justify-between border-t border-white/5 pt-3">
                                <div className="flex items-center gap-1">
                                    <button 
                                        type="button" 
                                        onClick={() => handleInsertFormat('bold')}
                                        className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/5 transition" 
                                        title="Bold"
                                    >
                                        <Bold size={15} />
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => handleInsertFormat('italic')}
                                        className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/5 transition" 
                                        title="Italic"
                                    >
                                        <Italic size={15} />
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => handleInsertFormat('strike')}
                                        className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/5 transition" 
                                        title="Strikethrough"
                                    >
                                        <Strikethrough size={15} />
                                    </button>
                                    <div className="w-px h-4 bg-white/10 mx-1" />
                                    <button 
                                        type="button" 
                                        onClick={() => handleInsertFormat('spoiler')}
                                        className="px-2 py-1 text-xs font-bold text-purple-400 bg-purple-950/40 hover:bg-purple-900/50 rounded border border-purple-500/30 transition flex items-center gap-1.5 cursor-pointer"
                                        title="Insert Spoiler Tag"
                                    >
                                        <EyeOff size={13} /> Spoiler
                                    </button>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={submitting || !newComment.trim()}
                                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-purple-600/30 cursor-pointer"
                                >
                                    {submitting ? 'Posting...' : <><Send size={14} /> Post Comment</>}
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="text-center py-6">
                        <p className="text-gray-400 mb-3 text-sm">Sign in to join the discussion and share theories</p>
                        <Link to="/login" className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl inline-block transition">
                            Log In
                        </Link>
                    </div>
                )}
            </div>

            {/* COMMENT THREAD LIST (Cursor-like smooth rendering) */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center text-gray-500 py-12 flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                        <span>Streaming discussion...</span>
                    </div>
                ) : sortedComments.length > 0 ? (
                    sortedComments.map(comment => (
                        <div key={comment.id} className="bg-[#0E0E15] border border-white/5 rounded-2xl p-5 flex gap-4 transition hover:border-white/10">
                            <img src={comment.avatarUrl} className="w-10 h-10 rounded-full border border-white/10 flex-shrink-0" alt={comment.username} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-white text-sm">{comment.displayName || comment.username}</h4>
                                        {comment.userId === 'u1' && (
                                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-900/50 text-purple-300 border border-purple-500/30">
                                                Staff
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500">{comment.timestamp}</span>
                                </div>
                                
                                <div className="text-gray-300 text-sm leading-relaxed mb-3">
                                    <FormattedCommentContent content={comment.content} />
                                </div>

                                <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                                    <button 
                                        onClick={() => handleLikeComment(comment.id)}
                                        className="flex items-center gap-1.5 text-gray-400 hover:text-purple-400 transition cursor-pointer"
                                    >
                                        <ThumbsUp size={14} /> {comment.likes}
                                    </button>
                                    <span className="hover:text-gray-300 transition cursor-pointer">Reply</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 py-12 bg-[#0E0E15] rounded-2xl border border-white/5 border-dashed">
                        No comments yet on this chapter. Be the first to start the discussion!
                    </div>
                )}
            </div>
        </div>
    );
};

export default Comments;