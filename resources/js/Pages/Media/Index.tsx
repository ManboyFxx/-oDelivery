import React, { useState, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import { Upload, Trash2, Image, Search, Loader2, Copy, Check, RotateCcw } from 'lucide-react';

interface MediaFile {
    id: string;
    original_name: string;
    filename: string;
    url: string;
    size: number;
    mime_type: string;
    created_at: string;
}

interface Props {
    auth: any;
    media: MediaFile[];
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaIndex({ auth, media: initialMedia }: Props) {
    const [media, setMedia] = useState<MediaFile[]>(initialMedia);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleUpload = async (files: FileList | null) => {
        if (!files?.length) return;
        setUploading(true);
        try {
            const newFiles: MediaFile[] = [];
            for (const file of Array.from(files)) {
                const form = new FormData();
                form.append('file', file);
                const res = await axios.post('/media', form, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                newFiles.push(res.data);
            }
            setMedia(prev => [...newFiles, ...prev]);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deletar esta imagem? Produtos que usam ela perderão a imagem.')) return;
        await axios.delete(`/media/${id}`);
        setMedia(prev => prev.filter(m => m.id !== id));
    };

    const copyUrl = async (file: MediaFile) => {
        await navigator.clipboard.writeText(file.url);
        setCopiedId(file.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filtered = media.filter(m =>
        m.original_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Banco de Imagens" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Banco de Imagens</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {media.length} imagem{media.length !== 1 ? 's' : ''} · Faça upload uma vez e reutilize em qualquer lugar
                        </p>
                    </div>

                    {/* Upload button */}
                    <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
                        {uploading ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                        ) : (
                            <><Upload className="h-4 w-4" /> Upload de Imagem</>
                        )}
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            multiple
                            disabled={uploading}
                            onChange={e => handleUpload(e.target.files)}
                        />
                    </label>
                </div>

                {/* Search */}
                <div className="relative mb-6 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por nome..."
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                    />
                </div>

                {/* Drop Zone (when empty or dragging) */}
                {(media.length === 0 || dragOver) && (
                    <div
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
                        className={`border-2 border-dashed rounded-2xl p-16 text-center mb-8 transition-colors ${
                            dragOver
                                ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/10'
                                : 'border-gray-200 dark:border-white/10'
                        }`}
                    >
                        <Image className="h-16 w-16 mx-auto mb-4 text-gray-200 dark:text-gray-700" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            {dragOver ? 'Solte para fazer upload' : 'Arraste imagens aqui ou clique em "Upload de Imagem"'}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">PNG, JPG, GIF, WebP até 10MB</p>
                    </div>
                )}

                {/* Grid */}
                {filtered.length > 0 && (
                    <div
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                    >
                        {filtered.map(file => (
                            <div
                                key={file.id}
                                className="group relative bg-gray-100 dark:bg-white/5 rounded-xl overflow-hidden aspect-square border border-gray-200 dark:border-white/10 hover:border-orange-400 dark:hover:border-orange-500 transition-all"
                            >
                                <img
                                    src={file.url}
                                    alt={file.original_name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />

                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                    {/* Top actions */}
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={() => copyUrl(file)}
                                            title="Copiar URL"
                                            className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                                        >
                                            {copiedId === file.id ? (
                                                <Check className="h-3.5 w-3.5" />
                                            ) : (
                                                <Copy className="h-3.5 w-3.5" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(file.id)}
                                            title="Deletar"
                                            className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg text-white transition-colors"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    {/* Bottom info */}
                                    <div>
                                        <p className="text-white text-xs font-medium truncate leading-tight">
                                            {file.original_name}
                                        </p>
                                        <p className="text-white/60 text-xs">{formatBytes(file.size)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {filtered.length === 0 && media.length > 0 && (
                    <p className="text-center text-gray-400 py-16 text-sm">
                        Nenhuma imagem encontrada para "{search}"
                    </p>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
