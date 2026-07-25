import React, { useState, useEffect } from 'react';
import { getComments, addComment, getUser } from '../services/mockBackend';
import { Comment, User } from '../types';
import { MessageSquare, ThumbsUp, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CommentsProps {
    mangaId: string;
}

const Comments: React.FC<CommentsProps> = ({ mangaId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [fetchedComments, fetchedUser] = await Promise.all([
                getComments(mangaId),
                getUser()
            ]);
            setComments(fetchedComments);
            setUser(fetchedUser);
            setLoading(false);
        };
        fetchData();
    }, [mangaId]);

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

    return (
        <div className="mt-12 max-w-4xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <MessageSquare className="text-purple-500" /> Comments 
                <span className="text-sm font-normal text-gray-500 bg-[#1a1a1a] px-3 py-1 rounded-full">{comments.length}</span>
            </h3>

            {/* Input */}
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6 mb-8">
                {user ? (
                    <form onSubmit={handleSubmit} className="flex gap-4">
                        <img src={user.avatarUrl} className="w-10 h-10 rounded-full border border-white/10" alt="User" />
                        <div className="flex-1">
                            <textarea 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Join the discussion..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 focus:outline-none resize-none h-24 mb-3"
                            />
                            <div className="flex justify-end">
                                <button 
                                    type="submit" 
                                    disabled={submitting || !newComment.trim()}
                                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition"
                                >
                                    {submitting ? 'Posting...' : <><Send size={16} /> Post Comment</>}
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-gray-400 mb-2">Login to post comments</p>
                        <Link to="/login" className="text-purple-500 font-bold hover:underline">Log In</Link>
                    </div>
                )}
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center text-gray-500 py-8">Loading discussion...</div>
                ) : comments.length > 0 ? (
                    comments.map(comment => (
                        <div key={comment.id} className="bg-[#111] border border-white/5 rounded-2xl p-6 flex gap-4">
                            <img src={comment.avatarUrl} className="w-12 h-12 rounded-full border border-white/10" alt={comment.username} />
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-white text-sm">{comment.displayName || comment.username}</h4>
                                    <span className="text-xs text-gray-500">{comment.timestamp}</span>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed mb-4">{comment.content}</p>
                                <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                                    <button className="flex items-center gap-1 hover:text-white transition">
                                        <ThumbsUp size={14} /> {comment.likes}
                                    </button>
                                    <button className="hover:text-white transition">Reply</button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 py-8 bg-[#111] rounded-2xl border border-white/5 border-dashed">
                        No comments yet. Be the first to start the conversation!
                    </div>
                )}
            </div>
        </div>
    );
};

export default Comments;