import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useRef } from 'react';
import type * as yup from 'yup';

/** Yup resolver that always uses the latest schema (e.g. after language change). */
export function useLocalizedYupResolver<T extends yup.AnyObjectSchema>(schema: T) {
  const schemaRef = useRef(schema);
  schemaRef.current = schema;

  return useMemo(
    () => (values: unknown, context: unknown, options: unknown) =>
      yupResolver(schemaRef.current)(values, context, options as never),
    [],
  );
}
