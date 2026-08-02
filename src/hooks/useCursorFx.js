import { useContext } from 'react';
import { CursorContext } from '@/context/CursorContext';

export function useCursorFx() {
  const context = useContext(CursorContext);

  if (context === undefined) {
    throw new Error('useCursorFx must be used within a CursorProvider');
  }

  return context;
}
