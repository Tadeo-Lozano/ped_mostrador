import type { CreateRequestInput, RequestPriority } from './types';

export type RequestFormState = {
  items: Array<{
    partCode: string;
    partDescription: string;
    quantity: string;
  }>;
  priority: RequestPriority;
  notes: string;
};

export type RequestFormValidation = {
  isValid: boolean;
  error: string | null;
  input: CreateRequestInput | null;
};

export function validateCreateRequestForm(
  form: RequestFormState,
): RequestFormValidation {
  const items = form.items.map((item) => ({
    partCode: item.partCode.trim(),
    partDescription: item.partDescription.trim(),
    quantity: Number(item.quantity),
  }));

  if (items.length === 0) {
    return {
      isValid: false,
      error: 'Agrega al menos una pieza.',
      input: null,
    };
  }

  for (const item of items) {
    if (!item.partCode) {
      return {
        isValid: false,
        error: 'Captura el codigo de todas las piezas.',
        input: null,
      };
    }

    if (item.partCode.length > 80) {
      return {
        isValid: false,
        error: 'El codigo no debe exceder 80 caracteres.',
        input: null,
      };
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return {
        isValid: false,
        error: 'Cada cantidad debe ser un numero entero mayor a cero.',
        input: null,
      };
    }

    if (item.partDescription.length > 180) {
      return {
        isValid: false,
        error: 'La descripcion no debe exceder 180 caracteres.',
        input: null,
      };
    }
  }

  return {
    isValid: true,
    error: null,
    input: {
      items,
      priority: form.priority,
      notes: form.notes,
    },
  };
}
