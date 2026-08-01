import { useState } from 'react';
import type { FC } from 'react';
import { X } from 'lucide-react';
import type { RosterMember } from '../types';
import type { TeamRole } from '@/types';

interface ChangeRoleSheetProps {
  member: RosterMember;
  isPending: boolean;
  onConfirm: (newRole: TeamRole) => void;
  onClose: () => void;
}

const ROLE_OPTIONS: { value: TeamRole; label: string; description: string }[] = [
  { value: 'admin',   label: 'Admin',   description: 'Full team management access' },
  { value: 'coach',   label: 'Coach',   description: 'Coach or assistant coach' },
  { value: 'player',  label: 'Player',  description: 'A player on the team' },
  { value: 'parent',  label: 'Parent',  description: 'Parent or guardian' },
  { value: 'manager', label: 'Manager', description: 'Team manager' },
];

export const ChangeRoleSheet: FC<ChangeRoleSheetProps> = ({
  member, isPending, onConfirm, onClose,
}) => {
  const [selectedRole, setSelectedRole] = useState<TeamRole>(member.role);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-pitch-800 border-t border-pitch-700 rounded-t-2xl px-4 pt-4 pb-10 z-10 max-h-[85vh] overflow-y-auto">
        <div className="w-10 h-1 bg-pitch-600 rounded-full mx-auto mb-5" />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl font-700 uppercase tracking-wide text-pitch-50">
              Change Role
            </h2>
            <p className="text-xs text-pitch-400 font-body mt-0.5">
              {member.profile.full_name || 'Unknown'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-pitch-400 active:bg-pitch-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-2 mb-6">
          {ROLE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedRole(option.value)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
                selectedRole === option.value
                  ? 'border-ember bg-ember-muted'
                  : 'border-pitch-700 bg-pitch-700/40'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${
                  selectedRole === option.value
                    ? 'border-ember bg-ember'
                    : 'border-pitch-500'
                }`}
              />
              <div>
                <p className={`text-sm font-display font-600 uppercase tracking-wide ${
                  selectedRole === option.value ? 'text-ember' : 'text-pitch-100'
                }`}>
                  {option.label}
                </p>
                <p className="text-xs text-pitch-400">{option.description}</p>
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onConfirm(selectedRole)}
          disabled={isPending || selectedRole === member.role}
          className="w-full py-3.5 rounded-xl bg-ember text-white font-display font-700 uppercase tracking-wider text-sm disabled:opacity-40 mb-3"
        >
          {isPending ? 'Updating…' : 'Confirm Change'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 rounded-xl border border-pitch-600 text-pitch-300 font-display font-600 uppercase tracking-wider text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
