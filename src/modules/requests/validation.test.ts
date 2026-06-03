import { describe, expect, it } from 'vitest';

import { validateCreateRequestForm } from './validation';
import type { RequestFormState } from './validation';

const validForm: RequestFormState = {
  items: [
    {
      partCode: ' abc-123 ',
      partDescription: 'Filtro de aceite',
      quantity: '2',
    },
  ],
  priority: 'normal',
  notes: 'Prueba',
};

describe('validateCreateRequestForm', () => {
  it('accepts a valid request and trims the part code', () => {
    const result = validateCreateRequestForm(validForm);

    expect(result.isValid).toBe(true);
    expect(result.input?.items[0].partCode).toBe('abc-123');
    expect(result.input?.items[0].quantity).toBe(2);
  });

  it('rejects an empty part code', () => {
    const result = validateCreateRequestForm({
      ...validForm,
      items: [{ ...validForm.items[0], partCode: ' ' }],
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Captura el codigo de todas las piezas.');
  });

  it('rejects non-positive quantities', () => {
    const result = validateCreateRequestForm({
      ...validForm,
      items: [{ ...validForm.items[0], quantity: '0' }],
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toBe(
      'Cada cantidad debe ser un numero entero mayor a cero.',
    );
  });
});
