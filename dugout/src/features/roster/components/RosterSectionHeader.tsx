import type { FC } from 'react';
import type { TeamRole } from '@/types';
import { ROLE_LABELS } from '../types';

interface RosterSectionHeaderProps {
  role: TeamRole;
  count: number;
  label?: string;
}

export const RosterSectionHeader: FC<RosterSectionHeaderProps> = ({ role, count, label }) => {
  return (
    <div className="mt-6 mb-3 flex items-baseline gap-2">
      <h2 className="font-display text-sm font-700 uppercase tracking-widest text-pitch-400">
        {label || ROLE_LABELS[role]}
      </h2>
      <span className="text-xs text-pitch-500 font-display font-600">{count}</span>
    </div>
  );
};
