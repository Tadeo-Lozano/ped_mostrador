type ErrorLike = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

export function formatError(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object') {
    const errorLike = error as ErrorLike;
    const parts = [
      errorLike.message,
      errorLike.code ? `Codigo: ${errorLike.code}` : undefined,
      errorLike.details ? `Detalle: ${errorLike.details}` : undefined,
      errorLike.hint ? `Sugerencia: ${errorLike.hint}` : undefined,
    ].filter(Boolean);

    if (parts.length > 0) {
      return parts.join(' | ');
    }
  }

  return fallback;
}
