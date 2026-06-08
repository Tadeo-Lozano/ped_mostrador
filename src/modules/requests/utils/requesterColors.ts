import type { RequestWithRequester } from '../types';

export type RequesterColor = {
  label: string;
  background: string;
  border: string;
  text: string;
};

export const REQUESTER_COLOR_PALETTE: RequesterColor[] = [
  {
    label: 'Azul',
    background: '#E3F2FD',
    border: '#1E88E5',
    text: '#0D47A1',
  },
  {
    label: 'Verde',
    background: '#E8F5E9',
    border: '#43A047',
    text: '#1B5E20',
  },
  {
    label: 'Naranja',
    background: '#FFF3E0',
    border: '#FB8C00',
    text: '#E65100',
  },
  {
    label: 'Morado',
    background: '#F3E5F5',
    border: '#8E24AA',
    text: '#4A148C',
  },
  {
    label: 'Rosa',
    background: '#FCE4EC',
    border: '#D81B60',
    text: '#880E4F',
  },
  {
    label: 'Turquesa',
    background: '#E0F7FA',
    border: '#00ACC1',
    text: '#006064',
  },
  {
    label: 'Lima',
    background: '#F9FBE7',
    border: '#C0CA33',
    text: '#827717',
  },
  {
    label: 'Rojo',
    background: '#FFEBEE',
    border: '#E53935',
    text: '#B71C1C',
  },
];

export const REQUESTER_COLOR_NAMES = {
  Ivan: REQUESTER_COLOR_PALETTE[0],
  Yair: REQUESTER_COLOR_PALETTE[1],
  Wicho: REQUESTER_COLOR_PALETTE[2],
  Rafa: REQUESTER_COLOR_PALETTE[3],
  Lore: REQUESTER_COLOR_PALETTE[4],
  Suleyma: REQUESTER_COLOR_PALETTE[5],
} as const;

const REQUESTER_COLOR_BY_NAME: Record<string, RequesterColor> = {
  ivan: REQUESTER_COLOR_NAMES.Ivan,
  yair: REQUESTER_COLOR_NAMES.Yair,
  wicho: REQUESTER_COLOR_NAMES.Wicho,
  rafa: REQUESTER_COLOR_NAMES.Rafa,
  lore: REQUESTER_COLOR_NAMES.Lore,
  suleyma: REQUESTER_COLOR_NAMES.Suleyma,
};

function normalizeName(value: string | null | undefined) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function getStablePaletteIndex(value: string) {
  return [...value].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  ) % REQUESTER_COLOR_PALETTE.length;
}

export function getRequesterColor(request: RequestWithRequester): RequesterColor {
  const requesterName = normalizeName(request.requester?.full_name);
  const firstName = requesterName.split(/\s+/)[0];

  if (REQUESTER_COLOR_BY_NAME[firstName]) {
    return REQUESTER_COLOR_BY_NAME[firstName];
  }

  return REQUESTER_COLOR_PALETTE[
    getStablePaletteIndex(request.requester?.id ?? (requesterName || request.id))
  ];
}
