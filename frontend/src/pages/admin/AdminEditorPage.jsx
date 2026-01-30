import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UniversalHeader from '../../components/layout/UniversalHeader';
import Icon from '../../components/common/Icon';

// Initial Mock Data for Sections
const INITIAL_SECTIONS = [
    { id: 'hero-1', type: 'Hero', title: 'Твой гардероб с искусственным интеллектом', subtitle: '✨ Искусственный интеллект для твоего стиля', description: 'Забудь о проблеме «нечего надеть». Наше приложение анализирует твою одежду и создает стильные образы.' },
    { id: 'features-1', type: 'Features', title: 'Больше, чем просто шкаф', description: 'Мы превращаем хаос в гармонию.' },
    { id: 'how-it-works-1', type: 'HowItWorks', title: 'Как это работает?', description: 'Всего три простых шага.' },
    { id: 'reviews-1', type: 'Testimonials', title: 'Что говорят пользователи', description: 'Отзывы наших клиентов.' },
    { id: 'cta-1', type: 'CTA', title: 'Создай свой первый образ сегодня', description: 'Присоединяйтесь к тысячам пользователей.' }
];

const SECTION_TEMPLATES = [
    { type: 'Hero', name: 'Hero баннер', icon: 'layout' },
    { type: 'Features', name: 'Преимущества', icon: 'grid' },
    { type: 'HowItWorks', name: 'Как это работает', icon: 'list' },
    { type: 'Testimonials', name: 'Отзывы', icon: 'message-square' },
    { type: 'CTA', name: 'Призыв к действию', icon: 'zap' },
    { type: 'Gallery', name: 'Галерея', icon: 'image' },
    { type: 'Text', name: 'Текстовый блок', icon: 'type' },
    { type: 'Divider', name: 'Разделитель', icon: 'minus' },
];

const AdminEditorPage = () => {
    const user = {
        name: 'Анна Петрова',
        email: 'anna@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
        isAdmin: true
    };

    const [sections, setSections] = useState(INITIAL_SECTIONS);
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    const [history, setHistory] = useState([INITIAL_SECTIONS]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [toast, setToast] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [status, setStatus] = useState('saved');
    const [draggedIndex, setDraggedIndex] = useState(null);

    const [selectedPage, setSelectedPage] = useState('home');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const pages = [
        { id: 'home', name: 'Главная страница', available: true },
        { id: 'login', name: 'Страница входа', available: false },
        { id: 'register', name: 'Страница регистрации', available: false },
        { id: 'wardrobe', name: 'Гардероб', available: false },
        { id: 'generator', name: 'Генератор образов', available: false },
    ];

    const selectedPageData = pages.find(p => p.id === selectedPage);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const updateSections = (newSections, addToHistory = true) => {
        setSections(newSections);
        setStatus('unsaved');
        if (addToHistory) {
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(newSections);
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        }
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setSections(history[historyIndex - 1]);
            setStatus('unsaved');
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setSections(history[historyIndex + 1]);
            setStatus('unsaved');
        }
    };

    const handleSectionSelect = (id) => {
        setSelectedSectionId(id);
    };

    const handleSectionUpdate = (id, field, value) => {
        const newSections = sections.map(s => s.id === id ? { ...s, [field]: value } : s);
        updateSections(newSections);
    };

    const handleSectionDelete = (id) => {
        if (confirm('Вы уверены, что хотите удалить эту секцию?')) {
            const newSections = sections.filter(s => s.id !== id);
            updateSections(newSections);
            if (selectedSectionId === id) setSelectedSectionId(null);
            showToast('Секция удалена');
        }
    };

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newSections = [...sections];
        const draggedSection = newSections[draggedIndex];
        newSections.splice(draggedIndex, 1);
        newSections.splice(index, 0, draggedSection);
        setSections(newSections);
        setDraggedIndex(index);
        setStatus('unsaved');
    };

    const handleDragEnd = () => {
        if (draggedIndex !== null) {
            updateSections(sections);
        }
        setDraggedIndex(null);
    };

    const handleAddSection = (type) => {
        const newSection = {
            id: `${type.toLowerCase()}-${Date.now()}`,
            type: type,
            title: 'Новая секция',
            description: 'Описание секции',
        };
        const newSections = [...sections, newSection];
        updateSections(newSections);
        setSelectedSectionId(newSection.id);
        showToast('Секция добавлена');
    };

    const handlePublish = () => {
        setStatus('publishing');
        setTimeout(() => {
            setStatus('saved');
            showToast('Изменения опубликованы на сайте!');
        }, 1500);
    };

    const handleSelectPage = (pageId) => {
        setSelectedPage(pageId);
        setDropdownOpen(false);
    };

    const selectedSection = sections.find(s => s.id === selectedSectionId);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <UniversalHeader activePage="admin" user={user} />

            {/* Editor Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/admin" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <Icon name="arrow-left" size={24} className="text-gray-600" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Icon name="pencil" size={24} className="text-gray-700" />
                        <h1 className="text-lg font-bold text-gray-900">Редактор страниц</h1>
                    </div>

                    {/* Page Selector */}
                    <div className="relative ml-4" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 hover:border-gray-300 transition-all min-w-[200px]"
                        >
                            <div className="flex-1 text-left text-sm">
                                <span>{selectedPageData?.name}</span>
                            </div>
                            <svg
                                className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {dropdownOpen && (
                            <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
                                {pages.map(page => (
                                    <button
                                        key={page.id}
                                        onClick={() => handleSelectPage(page.id)}
                                        disabled={!page.available}
                                        className={`w-full px-4 py-2.5 text-left flex items-center justify-between transition-colors text-sm ${page.id === selectedPage
                                            ? 'bg-pink-50 text-primary'
                                            : page.available
                                                ? 'hover:bg-gray-50 text-gray-700'
                                                : 'text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        <span className="font-medium">{page.name}</span>
                                        {!page.available && (
                                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">скоро</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Undo/Redo */}
                    <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
                        <button
                            onClick={handleUndo}
                            disabled={historyIndex === 0}
                            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <Icon name="undo" size={20} className="text-gray-600" />
                        </button>
                        <button
                            onClick={handleRedo}
                            disabled={historyIndex >= history.length - 1}
                            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <Icon name="redo" size={20} className="text-gray-600" />
                        </button>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2 text-sm">
                        {status === 'saved' && (
                            <>
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-gray-500">Сохранено</span>
                            </>
                        )}
                        {status === 'unsaved' && (
                            <>
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <span className="text-gray-500">Не сохранено</span>
                            </>
                        )}
                        {status === 'publishing' && (
                            <>
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                <span className="text-gray-500">Публикация...</span>
                            </>
                        )}
                    </div>

                    {/* Publish */}
                    <button
                        onClick={handlePublish}
                        disabled={status === 'publishing' || status === 'saved'}
                        className="px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        <Icon name="upload" size={20} />
                        Опубликовать
                    </button>
                </div>
            </div>

            {/* Main Editor Area */}
            {selectedPage === 'home' ? (
                <div className="flex flex-1 overflow-hidden">
                    {/* Left: Templates */}
                    <div className={`w-64 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${isSidebarOpen ? '' : '-ml-64'}`}>
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <span className="font-bold text-sm text-gray-700">Блоки</span>
                            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 hover:bg-gray-100 rounded">
                                <Icon name="x" size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {SECTION_TEMPLATES.map(template => (
                                <button
                                    key={template.type}
                                    onClick={() => handleAddSection(template.type)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:border-primary hover:bg-pink-50 transition-all mb-3 text-left flex items-center gap-3"
                                >
                                    <Icon name={template.icon} size={20} className="text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">{template.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Toggle Sidebar Button */}
                    {!isSidebarOpen && (
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="absolute left-4 top-36 z-30 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 text-gray-600"
                        >
                            <Icon name="panel-left" size={24} />
                        </button>
                    )}

                    {/* Center: Canvas */}
                    <div className="flex-1 overflow-y-auto p-8 flex justify-center" style={{
                        backgroundImage: 'radial-gradient(#ddd 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}>
                        <div className="w-full max-w-4xl bg-white shadow-2xl min-h-[600px]">
                            {sections.map((section, index) => (
                                <div
                                    key={section.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => handleSectionSelect(section.id)}
                                    className={`relative border-2 transition-all group cursor-pointer ${selectedSectionId === section.id
                                        ? 'border-primary ring-2 ring-primary ring-opacity-20'
                                        : draggedIndex === index
                                            ? 'border-primary'
                                            : 'border-transparent hover:border-pink-200'
                                        }`}
                                >
                                    {/* Section Controls */}
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleSectionDelete(section.id); }}
                                            className="p-1.5 bg-white rounded shadow-sm text-gray-400 hover:text-red-500 hover:bg-red-50"
                                        >
                                            <Icon name="trash-2" size={16} />
                                        </button>
                                    </div>

                                    {/* Drag Handle */}
                                    <div className="absolute top-1/2 -left-8 -translate-y-1/2 p-1.5 bg-white rounded shadow-sm text-gray-400 cursor-move opacity-0 group-hover:opacity-100 hover:text-gray-600 transition-all z-20">
                                        <Icon name="grip-vertical" size={16} />
                                    </div>

                                    {/* Section Preview */}
                                    <div className="p-8 min-h-[120px]">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium">
                                                {section.type}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{section.title}</h3>
                                        <p className="text-sm text-gray-500">{section.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Properties */}
                    <div className={`w-80 bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ${selectedSection ? '' : 'w-0 overflow-hidden'}`}>
                        {selectedSection && (
                            <>
                                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                                    <span className="font-bold text-sm text-gray-700">Свойства</span>
                                    <button onClick={() => setSelectedSectionId(null)} className="p-1 hover:bg-gray-100 rounded">
                                        <Icon name="x" size={20} className="text-gray-500" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
                                        <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">{selectedSection.type}</div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
                                        <input
                                            type="text"
                                            value={selectedSection.title}
                                            onChange={(e) => handleSectionUpdate(selectedSection.id, 'title', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                                        <textarea
                                            value={selectedSection.description}
                                            onChange={(e) => handleSectionUpdate(selectedSection.id, 'description', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                        />
                                    </div>
                                    {selectedSection.subtitle && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Подзаголовок</label>
                                            <input
                                                type="text"
                                                value={selectedSection.subtitle}
                                                onChange={(e) => handleSectionUpdate(selectedSection.id, 'subtitle', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 max-w-md">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <Icon name="lock" size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Недоступно для редактирования</h3>
                        <p className="text-gray-500">Редактирование этой страницы будет добавлено в будущих обновлениях.</p>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 z-50 animate-bounce-in ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-gray-900 text-white'
                    }`}>
                    <Icon name={toast.type === 'success' ? 'check-circle' : 'info'} size={20} />
                    <span>{toast.message}</span>
                </div>
            )}

            <style>{`
                @keyframes bounce-in {
                    0% { transform: translateX(-50%) translateY(100px); opacity: 0; }
                    50% { transform: translateX(-50%) translateY(-10px); }
                    100% { transform: translateX(-50%) translateY(0); opacity: 1; }
                }
                .animate-bounce-in {
                    animation: bounce-in 0.4s ease-out;
                }
            `}</style>
        </div>
    );
};

export default AdminEditorPage;
