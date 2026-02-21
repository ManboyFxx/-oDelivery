import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { X, Upload, Trash2, Check, Image, Search, Loader2 } from 'lucide-react';

interface MediaFile {
    id: string;
    original_name: string;
    filename: string;
    url: string;
    size: number;
    mime_type: string;
    created_at: string;
}

interface MediaPickerModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (media: MediaFile) => void;
    currentUrl?: string | null;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPickerModal({ open, onClose, onSelect, currentUrl }: MediaPickerModalProps) {
    const [media, setMedia] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState<'library' | 'upload'>('library');
    const [dragOver, setDragOver] = useState(false);

    const fetchMedia = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/media');
            setMedia(res.data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (open) {
            fetchMedia();
            setSelected(null);
            setSearch('');
            setTab('library');
        }
    }, [open, fetchMedia]);

    const handleUpload = async (files: FileList | null) => {
        if (!files?.length) return;
        setUploading(true);
        try {
            for (const file of Array.from(files)) {
                const form = new FormData();
                form.append('file', file);
                await axios.post('/media', form, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            await fetchMedia();
            setTab('library');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Deletar esta imagem?')) return;
        await axios.delete(`/media/${id}`);
        setMedia(prev => prev.filter(m => m.id !== id));
        if (selected === id) setSelected(null);
    };

    const handleConfirm = () => {
        const file = media.find(m => m.id === selected);
        if (file) {
            onSelect(file);
            onClose();
        }
    };

    const filtered = media.filter(m =>
        m.original_name.toLowerCase().includes(search.toLowerCase())
    );

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <Image className="h-5 w-5 text-orange-500" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Banco de Imagens</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-white/10 px-6">
                    {(['library', 'upload'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                                tab === t
                                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            {t === 'library' ? `Biblioteca (${media.length})` : 'Upload'}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {tab === 'library' ? (
                        <>
                            {/* Search */}
                            <div className="px-6 py-3 border-b border-gray-100 dark:border-white/5">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Buscar imagens..."
                                        className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Grid */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {loading ? (
                                    <div className="flex items-center justify-center h-48">
                                        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                                    </div>
                                ) : filtered.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                        <Image className="h-12 w-12 mb-3 opacity-30" />
                                        <p className="text-sm">Nenhuma imagem encontrada</p>
                                        <button onClick={() => setTab('upload')} className="mt-3 text-sm text-orange-500 hover:underline">
                                            Fazer upload
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                        {filtered.map(file => (
                                            <div
                                                key={file.id}
                                                onClick={() => setSelected(file.id === selected ? null : file.id)}
                                                className={`relative group cursor-pointer rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                                                    selected === file.id
                                                        ? 'border-orange-500 ring-2 ring-orange-500/30'
                                                        : 'border-transparent hover:border-gray-300 dark:hover:border-white/20'
                                                }`}
                                            >
                                                <img
                                                    src={file.url}
                                                    alt={file.original_name}
                                                    className="w-full h-full object-cover"
                                                />
                                                {/* Selected overlay */}
                                                {selected === file.id && (
                                                    <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                                                        <div className="bg-orange-500 rounded-full p-1">
                                                            <Check className="h-3 w-3 text-white" />
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Hover actions */}
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end pb-2 gap-1">
                                                    <p className="text-white text-xs px-2 text-center leading-tight truncate w-full text-center">
                                                        {file.original_name}
                                                    </p>
                                                    <p className="text-white/60 text-xs">{formatBytes(file.size)}</p>
                                                    <button
                                                        onClick={(e) => handleDelete(file.id, e)}
                                                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        /* Upload Tab */
                        <div className="flex-1 flex items-center justify-center p-8">
                            <div
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
                                className={`w-full max-w-md border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
                                    dragOver
                                        ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/10'
                                        : 'border-gray-300 dark:border-white/20 hover:border-orange-400'
                                }`}
                            >
                                {uploading ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Enviando imagens...</p>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Arraste imagens aqui
                                        </p>
                                        <p className="text-xs text-gray-400 mb-4">ou clique para selecionar</p>
                                        <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-colors">
                                            <Upload className="h-4 w-4" />
                                            Selecionar arquivos
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                multiple
                                                onChange={e => handleUpload(e.target.files)}
                                            />
                                        </label>
                                        <p className="text-xs text-gray-400 mt-4">PNG, JPG, GIF, WebP até 10MB</p>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 dark:border-white/10">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selected ? '1 imagem selecionada' : 'Selecione uma imagem da biblioteca'}
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!selected}
                            className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
                        >
                            Usar imagem
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
