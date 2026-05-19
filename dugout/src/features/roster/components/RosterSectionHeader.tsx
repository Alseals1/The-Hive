import type { FC } from 'react';
import type { TeamRole } from '@/types';
import { ROLE_LABELS } from '../types';

interface RosterSectionHeaderProps {
  role: TeamRole;
  count: number;
}

export const RosterSectionHeader: FC<RosterSectionHeaderProps> = ({ role, count }) => {
  return (
    <div className="mt-6 mb-3 px-4 flex items-baseline gap-2">
      <h2 className="text-lg font-bold text-dugout-dark">{ROLE_LABELS[role]}</h2>
      <span className="text-sm text-dugout-mid font-medium">({count})</span>
    </div>
  );
};
