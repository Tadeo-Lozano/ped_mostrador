import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase/client';
import type { RequestRow } from '../types';

export type RequestRealtimeEvent =
  | {
      type: 'insert';
      request: RequestRow;
    }
  | {
      type: 'update';
      request: RequestRow;
      previousRequest: Partial<RequestRow>;
    }
  | {
      type: 'delete';
      oldRequest: Partial<RequestRow>;
    };

type RequestRealtimeScope =
  | {
      type: 'mine';
      requesterId: string;
    }
  | {
      type: 'operational';
    };

type SubscribeToRequestsOptions = {
  scope: RequestRealtimeScope;
  onEvent: (event: RequestRealtimeEvent) => void;
  onError?: (message: string) => void;
};

function mapPayload(
  payload: RealtimePostgresChangesPayload<RequestRow>,
): RequestRealtimeEvent | null {
  if (payload.eventType === 'INSERT') {
    return {
      type: 'insert',
      request: payload.new,
    };
  }

  if (payload.eventType === 'UPDATE') {
    return {
      type: 'update',
      request: payload.new,
      previousRequest: payload.old,
    };
  }

  if (payload.eventType === 'DELETE') {
    return {
      type: 'delete',
      oldRequest: payload.old,
    };
  }

  return null;
}

function matchesScope(event: RequestRealtimeEvent, scope: RequestRealtimeScope) {
  if (scope.type === 'operational') {
    return true;
  }

  if (event.type === 'delete') {
    return event.oldRequest.requester_id === scope.requesterId;
  }

  return event.request.requester_id === scope.requesterId;
}

export function subscribeToRequests({
  scope,
  onEvent,
  onError,
}: SubscribeToRequestsOptions) {
  const channel = supabase
    .channel(`requests:${scope.type}:${scope.type === 'mine' ? scope.requesterId : 'all'}`)
    .on<RequestRow>(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'requests',
      },
      (payload) => {
        const event = mapPayload(payload);

        if (event && matchesScope(event, scope)) {
          onEvent(event);
        }
      },
    )
    .subscribe((status, error) => {
      if (status === 'CHANNEL_ERROR') {
        onError?.(
          error?.message ??
            'No se pudo activar la suscripcion en tiempo real.',
        );
      }
    });

  return () => {
    void supabase.removeChannel(channel);
  };
}
