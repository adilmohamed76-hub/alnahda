import React, { useState, useMemo } from 'react';
import type { User, Permission, UserRole } from './types';
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon, SortAscIcon, SortDescIcon } from './Icons';
import UserModal from './UserModal';
import ConfirmationModal from './ConfirmationModal';

interface UserManagementTableProps {
  users: User[];
  onUpdateUser: (user: Pick<User, 'id' | 'name' | 'role' | 'status'>) => void;
  onDeleteUser: (userId: number) => void;
  onAddUser: (userData: Omit<User, 'id' | 'avatar' | 'status' | 'email'> & { email: string, password: string, role: UserRole }) => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
}

type SortKey = keyof User;

const UserManagementTable: React.FC<UserManagementTableProps> = ({ users, onUpdateUser, onDeleteUser, onAddUser, hasPermission }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);
  
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const sortedUsers = useMemo(() => {
    let sortableItems = [...filteredUsers];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredUsers, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setUserModalOpen(true);
  };
  
  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setUserModalOpen(true);
  };

  const handleOpenDeleteConfirm = (user: User) => {
    setUserToDelete(user);
    setConfirmModalOpen(true);
  };

  const handleSave = async (data: any) => {
    try {
      if (editingUser) { // Update mode
        onUpdateUser({ ...editingUser, ...data });
      } else { // Create mode
        await onAddUser(data);
      }
      setUserModalOpen(false);
    } catch (error) {
      // Error is already handled in App.tsx with a notification,
      // but we don't close the modal on creation failure.
      console.error("Failed to save user:", error);
    }
  };

  const handleDeleteUser = () => {
    if (userToDelete) {
      onDeleteUser(userToDelete.id);
      setConfirmModalOpen(false);
      setUserToDelete(null);
    }
  };
  
  const SortIndicator: React.FC<{ columnKey: SortKey }> = ({ columnKey }) => {
      if (!sortConfig || sortConfig.key !== columnKey) return null;
      return sortConfig.direction === 'asc' ? <SortAscIcon /> : <SortDescIcon />;
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-1/3">
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="بحث عن مستخدم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 text-sm text-gray-700 bg-gray-200/50 dark:bg-gray-900/50 dark:text-gray-300 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          />
        </div>
        {hasPermission('MANAGE_USERS') && (
            <button
                onClick={handleOpenAddModal}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color-hover)]"
            >
                <PlusIcon />
                إضافة مستخدم جديد
            </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                <button onClick={() => requestSort('name')} className="flex items-center gap-1">المستخدم <SortIndicator columnKey="name" /></button>
              </th>
              <th scope="col" className="px-6 py-3">
                <button onClick={() => requestSort('role')} className="flex items-center gap-1">الدور <SortIndicator columnKey="role" /></button>
              </th>
              <th scope="col" className="px-6 py-3">
                <button onClick={() => requestSort('status')} className="flex items-center gap-1">الحالة <SortIndicator columnKey="status" /></button>
              </th>
              <th scope="col" className="px-6 py-3 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <tr key={user.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full"/>
                        <div>
                            <div className="font-medium text-gray-900 whitespace-nowrap dark:text-white">{user.name}</div>
                            <div className="text-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">{user.email}</div>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4">{user.role}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    user.status === 'Active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                  }`}>
                    {user.status === 'Active' ? 'نشط' : 'غير نشط'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center items-center gap-2">
                    {hasPermission('MANAGE_USERS') && (
                      <>
                        <button onClick={() => handleOpenEditModal(user)} className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full"><PencilIcon /></button>
                        <button onClick={() => handleOpenDeleteConfirm(user)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><TrashIcon /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedUsers.length === 0 && (
           <p className="text-center py-8 text-gray-500 dark:text-gray-400">
              لا يوجد مستخدمون مطابقون لبحثك.
          </p>
        )}
      </div>

      {isUserModalOpen && (
        <UserModal 
            isOpen={isUserModalOpen}
            onClose={() => setUserModalOpen(false)}
            onSave={handleSave}
            user={editingUser}
        />
      )}
      
      {isConfirmModalOpen && userToDelete && (
        <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={() => setConfirmModalOpen(false)}
            onConfirm={handleDeleteUser}
            title="تأكيد الحذف"
            message={`هل أنت متأكد من رغبتك في حذف المستخدم "${userToDelete.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        />
      )}
    </>
  );
};

export default UserManagementTable;