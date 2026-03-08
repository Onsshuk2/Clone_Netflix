import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Layout, Plus, X } from 'lucide-react';
import { ApiAdminFilms } from '../../api/ApiAdminFilms'; // твій шлях
import ContentModal from '../../components/ContentModal';
import { useNavigate } from 'react-router-dom';

interface ContentItem {
    id: string;
    title: string;
    description?: string;
    type: number;
    releaseYear?: number;
    duration?: number;
    rating?: number;
    ageLimit?: number;
    posterUrl?: string;
    detailsPosterUrl?: string;
    trailerUrl?: string;
    genreIds?: string[];
    franchiseId?: string;
    collectionIds?: string[];
}

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminContents() {
    const [contents, setContents] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
    const navigate = useNavigate();
    useEffect(() => {
        loadContents();
    }, []);

    const loadContents = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await ApiAdminFilms.contents.getAll();
            const items = data?.items || [];
            setContents(Array.isArray(items) ? items : []);
        } catch (err: any) {
            console.error('Помилка завантаження контенту:', err);
            setError('Не вдалося завантажити контент');
            toast.error('Помилка завантаження');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (formData: FormData) => {
        try {
            if (editingItem) {
                await ApiAdminFilms.contents.updateMultipart(editingItem.id, formData);
                toast.success('Контент оновлено');
            } else {
                await ApiAdminFilms.contents.createMultipart(formData);
                toast.success('Контент додано');
            }
            setModalOpen(false);
            setEditingItem(null);
            loadContents();
        } catch (err: any) {
            console.error('Помилка збереження:', err);
            toast.error(err.message || 'Помилка збереження');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Видалити цей контент назавжди?')) return;
        try {
            await ApiAdminFilms.contents.delete(id);
            toast.success('Контент видалено');
            loadContents();
        } catch (err: any) {
            toast.error('Не вдалося видалити контент');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 py-12 px-6 text-white">
            <div className="max-w-7xl mx-auto">
                {/* Заголовок + кнопки */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                        Контент
                    </h1>

                    <button
                        onClick={() => {
                            setEditingItem(null);
                            setModalOpen(true);
                        }}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-8 py-4 rounded-2xl font-bold shadow-xl transform hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Plus size={20} /> Додати контент
                    </button>
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-8 py-4 rounded-2xl font-bold shadow-xl transform hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Layout size={20} /> Панель користувачів
                    </button>
                </div>

                {/* Стан завантаження / помилка / порожньо */}
                {loading ? (
                    <div className="text-center py-32 text-indigo-400 text-2xl animate-pulse">Завантаження...</div>
                ) : error ? (
                    <div className="text-center py-32 text-red-500 text-2xl">{error}</div>
                ) : contents.length === 0 ? (
                    <div className="text-center py-32 text-gray-400 text-2xl">Контенту ще немає</div>
                ) : (
                    <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-800 shadow-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-800">
                                <thead className="bg-gray-800/50">
                                    <tr>
                                        <th className="px-8 py-5 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                            Постер
                                        </th>
                                        <th className="px-8 py-5 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                            Назва
                                        </th>
                                        <th className="px-8 py-5 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                            Тип / Рейтинг
                                        </th>
                                        <th className="px-8 py-5 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                            Рік
                                        </th>
                                        <th className="px-8 py-5 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                            Дії
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {contents.map((item) => (
                                        <tr key={item.id} className="hover:bg-indigo-950/30 transition duration-200">
                                            <td className="px-8 py-6">
                                                {item.posterUrl ? (
                                                    <img
                                                        src={`${baseUrl}/${item.posterUrl}`}
                                                        alt={item.title}
                                                        className="w-16 h-24 object-cover rounded-lg shadow-md ring-1 ring-indigo-500/30"
                                                        onError={(e) => {
                                                            e.currentTarget.src = 'https://via.placeholder.com/64x96?text=Немає+постера';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-16 h-24 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                                                        немає
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 font-medium text-white">{item.title || '—'}</td>
                                            <td className="px-8 py-6 text-gray-300">
                                                {item.type === 1 ? 'Фільм' : 'Серіал'} {item.rating ? `(${item.rating})` : ''}
                                            </td>
                                            <td className="px-8 py-6 text-gray-300">{item.releaseYear || '—'}</td>
                                            <td className="px-8 py-6 text-center">
                                                <button
                                                    onClick={() => {
                                                        setEditingItem(item);
                                                        setModalOpen(true);
                                                    }}
                                                    className="text-indigo-400 hover:text-indigo-300 text-2xl mr-6 transition"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-red-400 hover:text-red-300 text-2xl transition"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Модальне вікно — має бути аналогічним за стилем */}
                <ContentModal
                    isOpen={modalOpen}
                    onClose={() => {
                        setModalOpen(false);
                        setEditingItem(null);
                    }}
                    initialData={editingItem}
                    onSave={handleSave}
                />
            </div>
        </div>
    );
}