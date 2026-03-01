import { useState, useEffect } from 'react';
import { ApiAdminFilms } from '../../api/ApiAdminFilms'; // твій шлях
import ContentModal from '../../components/ContentModal';

export default function AdminContents() {
    const [contents, setContents] = useState([]); // завжди масив!
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        loadContents();
    }, []);

    const loadContents = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await ApiAdminFilms.contents.getAll();

            console.log('Отримані дані з сервера:', data); // ← подивись в консоль, що саме повертає

            // Захищаємося від будь-якої фігні з сервера
            const safeContents = Array.isArray(data)
                ? data
                : Array.isArray(data?.results) // якщо пагінація
                    ? data.results
                    : Array.isArray(data?.data)
                        ? data.data
                        : [];

            setContents(safeContents);
        } catch (err: any) {
            console.error('Помилка завантаження:', err);
            setError(err.message || 'Не вдалося завантажити контент');
            setContents([]); // на випадок помилки — порожній масив
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (formData: FormData) => {
        try {
            if (editingItem) {
                // Якщо update теж multipart — адаптуй, або використовуй JSON якщо потрібно
                await ApiAdminFilms.contents.update(editingItem.id, formData);
            } else {
                await ApiAdminFilms.contents.createMultipart(formData); // ← використовуй multipart!
            }
            setModalOpen(false);
            setEditingItem(null);
            loadContents(); // оновлюємо список
        } catch (err: any) {
            alert('Помилка збереження:\n' + (err.message || 'Невідома помилка'));
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Видалити цей контент назавжди?')) return;

        try {
            await ApiAdminFilms.contents.delete(id);
            loadContents();
        } catch (err: any) {
            alert('Не вдалося видалити:\n' + (err.message || 'Невідома помилка'));
        }
    };

    if (loading) {
        return <div className="p-10 text-center text-xl text-gray-300">Завантаження контенту...</div>;
    }

    if (error) {
        return (
            <div className="p-10 text-center text-xl text-red-500">
                Помилка: {error}
                <button onClick={loadContents} className="ml-4 text-blue-400 underline">
                    Спробувати ще раз
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Контент (фільми / серіали)</h1>
                    <button
                        onClick={() => {
                            setEditingItem(null);
                            setModalOpen(true);
                        }}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors"
                    >
                        + Додати контент
                    </button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-800">
                    <table className="w-full text-left">
                        <thead className="bg-gray-800/80">
                            <tr>
                                <th className="px-5 py-4">Постер</th>
                                <th className="px-5 py-4">Назва</th>
                                <th className="px-5 py-4">Тип</th>
                                <th className="px-5 py-4">Рік</th>
                                <th className="px-5 py-4">Тривалість</th>
                                <th className="px-5 py-4 text-right">Дії</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contents.map((item) => (
                                <tr key={item.id} className="border-t border-gray-800 hover:bg-gray-900/40">
                                    <td className="px-5 py-4">
                                        {item.posterUrl ? (
                                            <img
                                                src={item.posterUrl}
                                                alt={item.title}
                                                className="w-16 h-24 object-cover rounded shadow-sm"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-16 h-24 bg-gray-800 rounded flex items-center justify-center text-xs text-gray-500">
                                                немає
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 font-medium">{item.title || 'Без назви'}</td>
                                    <td className="px-5 py-4">{item.type === 1 ? 'Фільм' : item.type === 2 ? 'Серіал' : '—'}</td>
                                    <td className="px-5 py-4">{item.releaseYear || '—'}</td>
                                    <td className="px-5 py-4">{item.duration ? `${item.duration} хв` : '—'}</td>
                                    <td className="px-5 py-4 text-right space-x-4">
                                        <button
                                            onClick={() => {
                                                setEditingItem(item);
                                                setModalOpen(true);
                                            }}
                                            className="text-blue-400 hover:text-blue-300"
                                        >
                                            ✎
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            🗑
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {contents.length === 0 && (
                    <div className="text-center py-16 text-gray-500">Контенту ще немає</div>
                )}
            </div>

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
    );
}