import { describe, expect, it } from 'vitest';

import { validateCreateRequestForm } from './validation';
import type { RequestFormState } from './validation';

const validForm: RequestFormState = {
  partCode: ' abc-123 ',
  partDescription: 'Filtro de aceite',
  quantity: '2',
  priority: 'normal',
  notes: 'Prueba',
};

describe('validateCreateRequestForm', () => {
  it('accepts a valid request and trims the part code', () => {
    const result = validateCreateRequestForm(validForm);

    expect(result.isValid).toBe(true);
    expect(result.input?.partCode).toBe('abc-123');
    expect(result.input?.quantity).toBe(2);
  });

  it('rejects an empty part code', () => {
    const result = validateCreateRequestForm({
      ...validForm,
      partCode: ' ',
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Captura el codigo de la pieza.');
  });

  it('rejects non-positive quantities', () => {
    const result = validateCreateRequestForm({
      ...validForm,
      quantity: '0',
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('La cantidad debe ser un numero entero mayor a cero.');
  });
});
