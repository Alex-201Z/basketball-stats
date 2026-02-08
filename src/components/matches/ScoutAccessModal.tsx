'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ScoutAccessModalProps {
    isOpen: boolean;
    onSubmit: (code: string) => void;
}

export function ScoutAccessModal({ isOpen, onSubmit }: ScoutAccessModalProps) {
    const [code, setCode] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-card w-full max-w-sm rounded-xl border shadow-2xl p-6 space-y-4">
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold">Accès Scout</h2>
                    <p className="text-sm text-muted-foreground">Ce match est protégé. Entrez le code pour accéder à la saisie.</p>
                </div>
                <input
                    type="password"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Code PIN"
                    className="w-full text-center text-2xl tracking-widest font-mono rounded-lg border bg-secondary py-3 focus:ring-2 ring-primary"
                    autoFocus
                />
                <Button className="w-full font-bold" size="lg" onClick={() => onSubmit(code)} disabled={!code}>
                    Déverrouiller
                </Button>
            </div>
        </div>
    );
}
