'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

type TableName = 'player_stats' | 'matches' | 'players' | 'teams';

interface UseRealtimeOptions {
  table: TableName;
  onInsert?: (payload: unknown) => void;
  onUpdate?: (payload: unknown) => void;
  onDelete?: (payload: unknown) => void;
  onChange?: (payload: unknown) => void;
}

export function useRealtime({
  table,
  onInsert,
  onUpdate,
  onDelete,
  onChange,
}: UseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // Créer un canal unique pour cette table
    const channel = supabase.channel(`realtime-${table}-${Date.now()}`);

    // Écouter les changements sur la table
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
      },
      (payload) => {
        // Appeler le callback général onChange
        onChange?.(payload);

        // Appeler les callbacks spécifiques selon le type d'événement
        switch (payload.eventType) {
          case 'INSERT':
            onInsert?.(payload.new);
            break;
          case 'UPDATE':
            onUpdate?.(payload.new);
            break;
          case 'DELETE':
            onDelete?.(payload.old);
            break;
        }
      }
    );

    // S'abonner au canal
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Realtime subscribed to ${table}`);
      }
    });

    channelRef.current = channel;

    // Cleanup : se désabonner quand le composant est démonté
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [table, onInsert, onUpdate, onDelete, onChange]);

  return channelRef.current;
}

// Hook simplifié pour rafraîchir les données lors de changements
export function useRealtimeRefresh(table: TableName, refetchFn: () => void) {
  useRealtime({
    table,
    onChange: () => {
      refetchFn();
    },
  });
}
