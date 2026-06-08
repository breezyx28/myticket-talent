import { TalentAuthContext } from '@/contexts/talentAuthContext';
import { useContext } from 'react';

export function useAuth() {
  const ctx = useContext(TalentAuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
