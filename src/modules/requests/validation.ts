import type { CreateRequestInput, RequestPriority } from './types';

export type RequestFormState = {
  partCode: string;
  partDescription: string;
  quantity: string;
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
  const partCode = form.partCode.trim();
  const quantity = Number(form.quantity);

  if (!partCode) {
    return {
      isValid: false,
      error: 'Captura el codigo de la pieza.',
      input: null,
    };
  }

  if (partCode.length > 80) {
    return {
      isValid: false,
      error: 'El codigo no debe exceder 80 caracteres.',
      input: null,
    };
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return {
      isValid: false,
      error: 'La cantidad debe ser un numero entero mayor a cero.',
      input: null,
    };
  }

  if (form.partDescription.trim().length > 180) {
    return {
      isValid: false,
      error: 'La descripcion no debe exceder 180 caracteres.',
      input: null,
    };
  }

  return {
    isValid: true,
    error: null,
    input: {
      partCode,
      partDescription: form.partDescription,
      quantity,
      priority: form.priority,
      notes: form.notes,
    },
  };
}
