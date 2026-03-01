// src/components/admin/ContentModal.jsx
import { useState, useEffect, useRef } from 'react';
import { ApiAdminFilms } from '../api/ApiAdminFilms';  // ← твій новий імпорт

export default function ContentModal({ isOpen, onClose, initialData, onSave }) {
    const isEdit = !!initialData;

    // Контент форма
    const [form, setForm] = useState({
        title: '',
        description: '',
        trailerUrl: '',
        releaseYear: '',
        rating: '',
        ageLimit: '',
        type: 1,
        duration: '',
        orderInFranchise: '',
    });

    const posterFileRef = useRef(null);
    const detailsPosterFileRef = useRef(null);
    const videoFileRef = useRef(null);

    const [genres, setGenres] = useState([]);
    const [franchises, setFranchises] = useState([]);
    const [collections, setCollections] = useState([]);

    const [selectedGenreIds, setSelectedGenreIds] = useState([]);
    const [selectedFranchiseId, setSelectedFranchiseId] = useState('');
    const [selectedCollectionIds, setSelectedCollectionIds] = useState([]);

    // Вкладені форми
    const [showFranchiseForm, setShowFranchiseForm] = useState(false);
    const [franchiseName, setFranchiseName] = useState('');
    const [franchiseLoading, setFranchiseLoading] = useState(false);

    const [showGenreForm, setShowGenreForm] = useState(false);
    const [genreName, setGenreName] = useState('');
    const [genreLoading, setGenreLoading] = useState(false);

    const [showEpisodeForm, setShowEpisodeForm] = useState(false);
    const [episodeForm, setEpisodeForm] = useState({
        number: '',
        title: '',
        description: '',
        duration: '',
    });
    const episodeVideoFileRef = useRef(null);
    const [episodeLoading, setEpisodeLoading] = useState(false);

    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        if (!isOpen) return;

        let mounted = true;

        const loadOptions = async () => {
            try {
                const [gRes, fRes, cRes] = await Promise.all([
                    ApiAdminFilms.genres.getAll(),       // ← змінено
                    ApiAdminFilms.franchises.getAll(),   // ← змінено
                    ApiAdminFilms.collections.getAll(),  // ← змінено
                ]);

                if (mounted) {
                    setGenres(gRes || []);
                    setFranchises(fRes || []);
                    setCollections(cRes || []);

                    if (initialData) {
                        setForm({
                            title: initialData.title || '',
                            description: initialData.description || '',
                            trailerUrl: initialData.trailerUrl || '',
                            releaseYear: initialData.releaseYear || '',
                            rating: initialData.rating || '',
                            ageLimit: initialData.ageLimit || '',
                            type: initialData.type || 1,
                            duration: initialData.duration || '',
                            orderInFranchise: initialData.orderInFranchise || '',
                        });
                        setSelectedGenreIds(initialData.genreIds || []);
                        setSelectedFranchiseId(initialData.franchiseId || '');
                        setSelectedCollectionIds(initialData.collectionIds || []);
                    }
                }
            } catch (err) {
                console.error('Помилка завантаження опцій:', err);
            }
        };

        loadOptions();

        return () => { mounted = false; };
    }, [isOpen, initialData]);

    const handleContentChange = (e) => {
        const { name, value } = e.target;
        const numericFields = ['releaseYear', 'rating', 'ageLimit', 'duration', 'orderInFranchise'];
        setForm((prev) => ({
            ...prev,
            [name]: numericFields.includes(name) ? (value === '' ? '' : Number(value)) : value,
        }));
    };

    const toggleGenre = (id) => {
        setSelectedGenreIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleCollection = (id) => {
        setSelectedCollectionIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const createFranchise = async () => {
        if (!franchiseName.trim()) return alert('Назва франшизи обов’язкова');

        setFranchiseLoading(true);
        try {
            const res = await ApiAdminFilms.franchises.create({ name: franchiseName }); // ← змінено
            const newId = typeof res === 'string' ? res : res.id || res;
            setFranchises((prev) => [...prev, { id: newId, name: franchiseName }]);
            setSelectedFranchiseId(newId);
            setFranchiseName('');
            setShowFranchiseForm(false);
        } catch (err) {
            alert('Помилка створення франшизи: ' + err.message);
        } finally {
            setFranchiseLoading(false);
        }
    };

    const createGenre = async () => {
        if (!genreName.trim()) return alert('Назва жанру обов’язкова');

        setGenreLoading(true);
        try {
            const res = await ApiAdminFilms.genres.create({ name: genreName }); // ← змінено
            const newId = typeof res === 'string' ? res : res.id || res;
            setGenres((prev) => [...prev, { id: newId, name: genreName }]);
            setSelectedGenreIds((prev) => [...prev, newId]);
            setGenreName('');
            setShowGenreForm(false);
        } catch (err) {
            alert('Помилка створення жанру: ' + err.message);
        } finally {
            setGenreLoading(false);
        }
    };

    const handleEpisodeChange = (e) => {
        const { name, value } = e.target;
        const numericFields = ['number', 'duration'];
        setEpisodeForm((prev) => ({
            ...prev,
            [name]: numericFields.includes(name) ? (value === '' ? '' : Number(value)) : value,
        }));
    };

    const addEpisode = async () => {
        if (!episodeForm.title.trim() || !episodeForm.number || !initialData?.id) {
            alert('Назва, номер та ID серіалу обов’язкові');
            return;
        }

        setEpisodeLoading(true);
        const fd = new FormData();
        fd.append('ContentId', initialData.id);
        fd.append('Number', episodeForm.number);
        fd.append('Title', episodeForm.title);
        fd.append('Description', episodeForm.description || '');
        fd.append('Duration', episodeForm.duration || 0);
        if (episodeVideoFileRef.current?.files?.[0]) {
            fd.append('VideoFile', episodeVideoFileRef.current.files[0]);
        }

        try {
            await ApiAdminFilms.episodes.addToContent(initialData.id, fd); // ← змінено
            alert('Епізод додано успішно');
            setEpisodeForm({ number: '', title: '', description: '', duration: '' });
            if (episodeVideoFileRef.current) episodeVideoFileRef.current.value = '';
            setShowEpisodeForm(false);
        } catch (err) {
            alert('Помилка створення епізоду: ' + err.message);
        } finally {
            setEpisodeLoading(false);
        }
    };

    const handleContentSubmit = async () => {
        if (!form.title.trim()) {
            alert('Назва обов’язкова');
            return;
        }

        const fd = new FormData();
        fd.append('Title', form.title);
        fd.append('Description', form.description || '');
        fd.append('TrailerUrl', form.trailerUrl || '');
        fd.append('ReleaseYear', form.releaseYear || 0);
        fd.append('Rating', form.rating || 0);
        fd.append('AgeLimit', form.ageLimit || 0);
        fd.append('Type', form.type);
        fd.append('Duration', form.duration || 0);
        fd.append('OrderInFranchise', form.orderInFranchise || 0);

        if (selectedFranchiseId) fd.append('FranchiseId', selectedFranchiseId);
        selectedGenreIds.forEach((id) => fd.append('GenreIds', id));
        selectedCollectionIds.forEach((id) => fd.append('CollectionIds', id));

        if (posterFileRef.current?.files?.[0]) fd.append('PosterFile', posterFileRef.current.files[0]);
        if (detailsPosterFileRef.current?.files?.[0]) fd.append('DetailsPosterFile', detailsPosterFileRef.current.files[0]);
        if (videoFileRef.current?.files?.[0]) fd.append('VideoFile', videoFileRef.current.files[0]);

        onSave(fd);
    };

    if (!isOpen) return null;

    const tabs = ['Основне', 'Медіа', 'Жанри', 'Франшиза/Колекції', 'Епізоди'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="bg-gray-900 text-gray-100 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">

                {/* Заголовок */}
                <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">
                        {isEdit ? 'Редагувати контент' : 'Новий контент'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-3xl leading-none text-gray-400 hover:text-white transition-colors"
                    >
                        ×
                    </button>
                </div>

                {/* Вкладки */}
                <div className="flex border-b border-gray-800 bg-gray-950">
                    {tabs.map((tab, idx) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(idx)}
                            className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === idx
                                    ? 'border-b-2 border-blue-500 text-blue-400 bg-gray-800'
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Контент вкладок */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Вкладка 0: Основне */}
                    {activeTab === 0 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block mb-1.5 text-sm font-medium">Назва *</label>
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleContentChange}
                                    required
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block mb-1.5 text-sm font-medium">Опис</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleContentChange}
                                    rows={4}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none resize-y"
                                />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block mb-1.5 text-sm font-medium">Рік випуску</label>
                                    <input
                                        name="releaseYear"
                                        type="number"
                                        value={form.releaseYear}
                                        onChange={handleContentChange}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1.5 text-sm font-medium">Тривалість (хв)</label>
                                    <input
                                        name="duration"
                                        type="number"
                                        value={form.duration}
                                        onChange={handleContentChange}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1.5 text-sm font-medium">Рейтинг</label>
                                    <input
                                        name="rating"
                                        type="number"
                                        step="0.1"
                                        value={form.rating}
                                        onChange={handleContentChange}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1.5 text-sm font-medium">Віковий ліміт</label>
                                    <input
                                        name="ageLimit"
                                        type="number"
                                        value={form.ageLimit}
                                        onChange={handleContentChange}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1.5 text-sm font-medium">Тип</label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm((p) => ({ ...p, type: Number(e.target.value) }))}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none"
                                    >
                                        <option value={1}>Фільм</option>
                                        <option value={2}>Серіал</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-1.5 text-sm font-medium">Порядок у франшизі</label>
                                    <input
                                        name="orderInFranchise"
                                        type="number"
                                        value={form.orderInFranchise}
                                        onChange={handleContentChange}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block mb-1.5 text-sm font-medium">Посилання на трейлер</label>
                                <input
                                    name="trailerUrl"
                                    value={form.trailerUrl}
                                    onChange={handleContentChange}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Вкладка 1: Медіа */}
                    {activeTab === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block mb-1.5 text-sm font-medium">Постер (файл)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={posterFileRef}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                />
                            </div>
                            <div>
                                <label className="block mb-1.5 text-sm font-medium">Детальний постер</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={detailsPosterFileRef}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                />
                            </div>
                            {form.type === 1 && (
                                <div>
                                    <label className="block mb-1.5 text-sm font-medium">Відео файл (фільм)</label>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        ref={videoFileRef}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Вкладка 2: Жанри */}
                    {activeTab === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Оберіть жанри</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {genres.map((g) => (
                                    <label key={g.id} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedGenreIds.includes(g.id)}
                                            onChange={() => toggleGenre(g.id)}
                                            className="w-5 h-5 accent-blue-500"
                                        />
                                        <span>{g.name || g.title || g.id}</span>
                                    </label>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowGenreForm(true)}
                                className="mt-4 text-blue-400 hover:text-blue-300 underline text-sm"
                            >
                                + Новий жанр
                            </button>
                        </div>
                    )}

                    {/* Вкладка 3: Франшиза / Колекції */}
                    {activeTab === 3 && (
                        <div className="space-y-8">
                            <div>
                                <label className="block mb-1.5 text-sm font-medium">Франшиза</label>
                                <select
                                    value={selectedFranchiseId}
                                    onChange={(e) => setSelectedFranchiseId(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none"
                                >
                                    <option value="">Не прив'язано</option>
                                    {franchises.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.name || f.title || f.id}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setShowFranchiseForm(true)}
                                    className="mt-2 text-blue-400 hover:text-blue-300 underline text-sm"
                                >
                                    + Нова франшиза
                                </button>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-3">Колекції</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {collections.map((c) => (
                                        <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedCollectionIds.includes(c.id)}
                                                onChange={() => toggleCollection(c.id)}
                                                className="w-5 h-5 accent-blue-500"
                                            />
                                            <span>{c.name || c.title || c.id}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Вкладка 4: Епізоди */}
                    {activeTab === 4 && (
                        <div className="space-y-6">
                            {form.type !== 2 ? (
                                <p className="text-center text-gray-400 py-12">
                                    Епізоди доступні тільки для серіалів
                                </p>
                            ) : !initialData?.id ? (
                                <p className="text-center text-gray-400 py-12">
                                    Спочатку створіть серіал, потім додасте епізоди
                                </p>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setShowEpisodeForm(true)}
                                        className="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
                                    >
                                        + Додати епізод
                                    </button>

                                    {showEpisodeForm && (
                                        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]">
                                            <div className="bg-gray-900 rounded-xl p-6 w-full max-w-lg mx-4">
                                                <h3 className="text-xl font-bold mb-6">Додати епізод</h3>

                                                <div className="space-y-5">
                                                    <div>
                                                        <label className="block mb-1.5 text-sm font-medium">Номер епізоду *</label>
                                                        <input
                                                            name="number"
                                                            type="number"
                                                            min="1"
                                                            value={episodeForm.number}
                                                            onChange={handleEpisodeChange}
                                                            required
                                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block mb-1.5 text-sm font-medium">Назва *</label>
                                                        <input
                                                            name="title"
                                                            value={episodeForm.title}
                                                            onChange={handleEpisodeChange}
                                                            required
                                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block mb-1.5 text-sm font-medium">Опис</label>
                                                        <textarea
                                                            name="description"
                                                            value={episodeForm.description}
                                                            onChange={handleEpisodeChange}
                                                            rows={3}
                                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none resize-y"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block mb-1.5 text-sm font-medium">Тривалість (хв)</label>
                                                        <input
                                                            name="duration"
                                                            type="number"
                                                            min="0"
                                                            value={episodeForm.duration}
                                                            onChange={handleEpisodeChange}
                                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block mb-1.5 text-sm font-medium">Відео файл</label>
                                                        <input
                                                            type="file"
                                                            accept="video/*"
                                                            ref={episodeVideoFileRef}
                                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                                        />
                                                    </div>

                                                    <div className="flex justify-end gap-4 pt-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowEpisodeForm(false)}
                                                            disabled={episodeLoading}
                                                            className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50"
                                                        >
                                                            Скасувати
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={addEpisode}
                                                            disabled={episodeLoading}
                                                            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg font-medium disabled:opacity-50"
                                                        >
                                                            {episodeLoading ? 'Додаємо...' : 'Додати епізод'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Футер */}
                <div className="px-6 py-5 border-t border-gray-800 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                        Скасувати
                    </button>
                    <button
                        type="button"
                        onClick={handleContentSubmit}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                    >
                        {isEdit ? 'Зберегти зміни' : 'Створити контент'}
                    </button>
                </div>

                {/* Вкладена модалка франшизи */}
                {showFranchiseForm && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]">
                        <div className="bg-gray-900 rounded-xl p-6 w-full max-w-sm mx-4">
                            <h3 className="text-xl font-bold mb-5">Нова франшиза</h3>
                            <input
                                value={franchiseName}
                                onChange={(e) => setFranchiseName(e.target.value)}
                                placeholder="Назва франшизи *"
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 mb-6 focus:border-blue-500 outline-none"
                            />
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowFranchiseForm(false)}
                                    disabled={franchiseLoading}
                                    className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50"
                                >
                                    Скасувати
                                </button>
                                <button
                                    type="button"
                                    onClick={createFranchise}
                                    disabled={franchiseLoading}
                                    className="px-5 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium disabled:opacity-50"
                                >
                                    {franchiseLoading ? 'Створюємо...' : 'Створити'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Вкладена модалка жанру */}
                {showGenreForm && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]">
                        <div className="bg-gray-900 rounded-xl p-6 w-full max-w-sm mx-4">
                            <h3 className="text-xl font-bold mb-5">Новий жанр</h3>
                            <input
                                value={genreName}
                                onChange={(e) => setGenreName(e.target.value)}
                                placeholder="Назва жанру *"
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 mb-6 focus:border-blue-500 outline-none"
                            />
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowGenreForm(false)}
                                    disabled={genreLoading}
                                    className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50"
                                >
                                    Скасувати
                                </button>
                                <button
                                    type="button"
                                    onClick={createGenre}
                                    disabled={genreLoading}
                                    className="px-5 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium disabled:opacity-50"
                                >
                                    {genreLoading ? 'Створюємо...' : 'Створити'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}