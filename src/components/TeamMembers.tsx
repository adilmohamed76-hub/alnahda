import React from 'react';
// FIX: Update import path for types
import type { User } from '../types/index';
import { MailIcon } from './Icons';

interface TeamMembersProps {
  users: User[];
}

const UserCard: React.FC<{ user: User }> = ({ user }) => (
  <div className="bg-[var(--background-light)] dark:bg-[var(--background-dark)] p-4 rounded-xl border border-[var(--border-light)] dark:border-[var(--border-dark)] text-center transform hover:-translate-y-1 hover:shadow-lg">
    <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white dark:border-gray-700 shadow-md" />
    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{user.name}</h3>
    <p className="text-sm text-[var(--primary-color)] font-medium">{user.role}</p>
    <div className="flex items-center justify-center mt-3 text-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
      <MailIcon className="w-4 h-4 ml-1" />
      <span>{user.email}</span>
    </div>
    <div className="mt-4">
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
        user.status === 'Active'
          ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
          : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
      }`}>
        {user.status === 'Active' ? 'نشط' : 'غير نشط'}
      </span>
    </div>
  </div>
);

const TeamMembers: React.FC<TeamMembersProps> = ({ users }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">أعضاء الفريق</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {users.map(member => (
          <UserCard key={member.id} user={member} />
        ))}
      </div>
    </div>
  );
};

export default TeamMembers;
