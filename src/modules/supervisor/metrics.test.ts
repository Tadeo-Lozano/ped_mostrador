import { describe, expect, it } from 'vitest';

import type { RequestRow } from '@/modules/requests/types';
import { buildSupervisorMetrics } from './metrics';

function request(overrides: Partial<RequestRow>): RequestRow {
  return {
    id: crypto.randomUUID(),
    part_code: 'ABC',
    part_description: null,
    quantity: 1,
    priority: 'normal',
    status: 'pendiente',
    requester_id: 'requester',
    picker_id: null,
    created_at: '2026-06-01T10:00:00.000Z',
    updated_at: '2026-06-01T10:00:00.000Z',
    delivered_at: null,
    received_at: null,
    notes: null,
    warehouse_location: 'arriba',
    order_group_id: null,
    picker_employee_number: null,
    ...overrides,
  };
}

describe('buildSupervisorMetrics', () => {
  it('counts requests by status and priority', () => {
    const metrics = buildSupervisorMetrics([
      request({ status: 'pendiente', priority: 'normal' }),
      request({ status: 'en_proceso', priority: 'critica' }),
      request({ status: 'recibida', priority: 'urgente' }),
    ]);

    expect(metrics.totalRequests).toBe(3);
    expect(metrics.openRequests).toBe(2);
    expect(metrics.receivedRequests).toBe(1);
    expect(metrics.criticalRequests).toBe(1);
    expect(metrics.byStatus.find((item) => item.status === 'pendiente')?.count).toBe(1);
    expect(metrics.byPriority.find((item) => item.priority === 'urgente')?.count).toBe(1);
  });

  it('computes average delivery and reception minutes', () => {
    const metrics = buildSupervisorMetrics([
      request({
        delivered_at: '2026-06-01T10:30:00.000Z',
        received_at: '2026-06-01T11:00:00.000Z',
      }),
      request({
        created_at: '2026-06-01T12:00:00.000Z',
        delivered_at: '2026-06-01T13:30:00.000Z',
        received_at: '2026-06-01T14:00:00.000Z',
      }),
    ]);

    expect(metrics.averageDeliveryMinutes).toBe(60);
    expect(metrics.averageReceptionMinutes).toBe(90);
  });
});
