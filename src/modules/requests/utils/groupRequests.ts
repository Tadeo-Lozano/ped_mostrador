import type { RequestStatus, RequestWithRequester } from '../types';

const statusRank: Record<RequestStatus, number> = {
  pendiente: 1,
  en_proceso: 2,
  surtida: 3,
  recibida: 4,
  no_encontrada: 5,
  cancelada: 6,
};

function getCombinedStatus(requests: RequestWithRequester[]): RequestStatus {
  if (requests.every((request) => request.status === 'recibida')) {
    return 'recibida';
  }

  if (requests.every((request) => request.status === 'surtida')) {
    return 'surtida';
  }

  if (requests.some((request) => request.status === 'en_proceso')) {
    return 'en_proceso';
  }

  if (requests.some((request) => request.status === 'pendiente')) {
    return 'pendiente';
  }

  return [...requests].sort(
    (first, second) => statusRank[first.status] - statusRank[second.status],
  )[0].status;
}

export function groupRequestsByOrder(
  requests: RequestWithRequester[],
): RequestWithRequester[] {
  const groups = new Map<string, RequestWithRequester[]>();

  for (const request of requests) {
    const groupKey = request.order_group_id ?? request.id;
    const currentGroup = groups.get(groupKey) ?? [];
    currentGroup.push(request);
    groups.set(groupKey, currentGroup);
  }

  return [...groups.values()].map((group) => {
    const sortedGroup = [...group].sort(
      (first, second) =>
        new Date(first.created_at).getTime() - new Date(second.created_at).getTime(),
    );
    const baseRequest = sortedGroup[0];
    const items = sortedGroup.flatMap((request) => request.request_items ?? []);
    const totalQuantity = items.reduce(
      (total, item) => total + item.quantity,
      0,
    );

    if (sortedGroup.length === 1) {
      return baseRequest;
    }

    return {
      ...baseRequest,
      part_code: `${items.length} PRODUCTOS`,
      part_description: `${sortedGroup.length} almacenes`,
      quantity: totalQuantity || sortedGroup.reduce(
        (total, request) => total + request.quantity,
        0,
      ),
      status: getCombinedStatus(sortedGroup),
      delivered_at: sortedGroup.every((request) => request.delivered_at)
        ? sortedGroup[0].delivered_at
        : null,
      received_at: sortedGroup.every((request) => request.received_at)
        ? sortedGroup[0].received_at
        : null,
      request_items: items,
      request_receipts: sortedGroup.flatMap(
        (request) => request.request_receipts ?? [],
      ),
    };
  });
}
