import { useEffect, useRef, useState } from 'react';

import type { RequestRealtimeEvent } from '../services/realtime.service';
import { subscribeToRequests } from '../services/realtime.service';

type RequestRealtimeScope =
  | {
      type: 'mine';
      requesterId: string;
    }
  | {
      type: 'operational';
    };

type UseRequestRealtimeOptions = {
  scope: RequestRealtimeScope;
  enabled?: boolean;
  onEvent: (event: RequestRealtimeEvent) => void | Promise<void>;
};

export function useRequestRealtime({
  scope,
  enabled = true,
  onEvent,
}: UseRequestRealtimeOptions) {
  const [error, setError] = useState<string | null>(null);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    return subscribeToRequests({
      scope,
      onEvent: (event) => {
        void onEventRef.current(event);
      },
      onError: setError,
    });
  }, [enabled, scope]);

  return {
    error,
  };
}
