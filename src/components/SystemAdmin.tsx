import React from 'react';
import type { User, Permission, UserRole } from '../types/index';
import UserManagementTable from './UserManagementTable';

interface SystemAdminProps {
  users: User[];
  onUpdateUser: (user: Pick<User, 'id' | 'name' | 'role' | 'status'>) => void;
  onDeleteUser: (userId: number) => void;
  onAddUser: (userData: Omit<User, 'id' | 'avatar' | 'status' | 'email'> & { email: string, password: string, role: UserRole }) => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
}

const SystemAdmin: React.FC<SystemAdminProps> = ({ users, onUpdateUser, onDeleteUser, onAddUser, hasPermission }) => {
  if (!hasPermission('VIEW_ADMIN')) {
    return (
      <div className="text-center p-8 bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-red-500">وصول مرفوض</h2>
        <p className="mt-2 text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
          ليس لديك الصلاحية اللازمة للوصول إلى هذه الصفحة.
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">إدارة المستخدمين</h1>
      
      <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg">
        <UserManagementTable users={users} onUpdateUser={onUpdateUser} onDeleteUser={onDeleteUser} onAddUser={onAddUser} hasPermission={hasPermission} />
      </div>
    </>
  );
};

export default SystemAdmin;
