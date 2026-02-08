'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Upload, X, Loader2 } from 'lucide-react';

interface MatchSheetModalProps {
    matchId: string;
    initialSheetUrl?: string | null;
    onSheetUpdate: (url: string | null) => void;
}

export function MatchSheetModal({ matchId, initialSheetUrl, onSheetUpdate }: MatchSheetModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation (Image uniquement, max 5MB)
        if (!file.type.startsWith('image/')) {
            alert('Veuillez sélectionner une image.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('L\'image ne doit pas dépasser 5MB.');
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await fetch('/api/upload?folder=match-sheets', {
                method: 'POST',
                body: formData,
            });

            const uploadData = await uploadRes.json();

            if (!uploadRes.ok || !uploadData.success) {
                throw new Error(uploadData.error || 'Erreur lors de l\'upload');
            }

            const publicUrl = uploadData.url;

            // Mettre à jour le match via l'API
            const response = await fetch(`/api/matches/${matchId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sheet_url: publicUrl }),
            });

            if (!response.ok) throw new Error('Erreur lors de la mise à jour du match');

            onSheetUpdate(publicUrl);
        } catch (error) {
            console.error('Erreur upload:', error);
            alert('Erreur lors de l\'envoi de l\'image.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Voulez-vous vraiment supprimer la feuille de match ?')) return;

        try {
            // Note: On ne supprime pas forcément le fichier du bucket pour l'instant, juste le lien en BDD
            const response = await fetch(`/api/matches/${matchId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sheet_url: null }),
            });

            if (!response.ok) throw new Error('Erreur serveur');

            onSheetUpdate(null);
        } catch (error) {
            console.error('Erreur suppression:', error);
            alert('Erreur lors de la suppression.');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Feuille de Match
                    {initialSheetUrl && <span className="flex h-2 w-2 rounded-full bg-green-500" />}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Feuille de Match</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-auto bg-muted/50 rounded-md flex items-center justify-center min-h-[300px] relative border border-dashed">
                    {initialSheetUrl ? (
                        <div className="relative w-full h-full min-h-[500px]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={initialSheetUrl}
                                alt="Feuille de match"
                                className="w-full h-full object-contain"
                            />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8"
                                onClick={handleDelete}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center p-8">
                            <p className="text-muted-foreground mb-4">Aucune feuille de match disponible</p>
                            <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                Téléverser une photo
                            </Button>
                        </div>
                    )}
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </DialogContent>
        </Dialog>
    );
}
