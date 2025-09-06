import React, { useState, useEffect, useRef } from 'react';
import type { User } from './types';
import { UploadIcon, UserCircleIcon, PhoneIcon, SaveAndNewIcon, LockClosedIcon, KeyIcon } from './Icons';

interface UserProfileProps {
  user: User;
  onSave: (userData: Pick<User, 'id' | 'name' | 'avatar' | 'phone'>) => Promise<User>;
  onChangePassword: (userId: number, currentPassword, newPassword) => Promise<void>;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onSave, onChangePassword }) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const [phone, setPhone] = useState(user.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(user.name);
    setAvatar(user.avatar);
    setPhone(user.phone || '');
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({ id: user.id, name, avatar, phone });
    } catch (error) {
      console.error("Failed to save profile", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("كلمتا المرور الجديدتان غير متطابقتين.");
      return;
    }
    if (newPassword.length < 6) {
        alert("يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل.");
        return;
    }
    setIsPasswordSaving(true);
    try {
        await onChangePassword(user.id, currentPassword, newPassword);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    } catch (error) {
        console.error("Failed to change password", error);
    } finally {
        setIsPasswordSaving(false);
    }
  };
  
  const handleAvatarUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newAvatarUrl = `https://i.pravatar.cc/150?u=${Date.now()}`;
      setAvatar(newAvatarUrl);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">ملفي الشخصي</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* User Info Card */}
        <div className="lg:col-span-1">
             <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg flex flex-col items-center text-center">
                <div className="relative group mb-4">
                    <img src={avatar} alt="الصورة الرمزية" className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg" />
                    <button type="button" onClick={handleAvatarUploadClick} className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-opacity duration-300" aria-label="تغيير الصورة الرمزية">
                        <UploadIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100" />
                    </button>
                </div>
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{user.name}</h2>
                <p className="text-[var(--primary-color)] font-semibold">{user.role}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user.phone}</p>
                <div className="mt-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                        {user.status === 'Active' ? 'حساب نشط' : 'حساب غير نشط'}
                    </span>
                </div>
             </div>
        </div>

        {/* Edit Forms */}
        <div className="lg:col-span-2 space-y-8">
            {/* Edit Profile Details */}
            <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">تعديل البيانات الشخصية</h3>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">الاسم الكامل</label>
                        <div className="relative"><span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"><UserCircleIcon /></span><input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-2 pr-10 bg-gray-100 dark:bg-gray-800 rounded-md" /></div>
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-1">رقم الهاتف</label>
                        <div className="relative"><span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"><PhoneIcon /></span><input type="tel" name="phone" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2 pr-10 bg-gray-100 dark:bg-gray-800 rounded-md" /></div>
                    </div>
                    <div>
                        <label htmlFor="avatarUrl" className="block text-sm font-medium mb-1">رابط الصورة الرمزية</label>
                        <input type="url" name="avatarUrl" id="avatarUrl" value={avatar} onChange={(e) => setAvatar(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md font-mono text-left" dir="ltr" />
                    </div>
                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-color)] text-white font-semibold rounded-lg disabled:bg-gray-400">
                            <SaveAndNewIcon />{isSaving ? 'جاري الحفظ...' : 'حفظ البيانات'}
                        </button>
                    </div>
                </form>
            </div>
            {/* Change Password */}
            <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">تغيير كلمة المرور</h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium mb-1">كلمة المرور الحالية</label>
                        <div className="relative"><span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"><LockClosedIcon /></span><input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full p-2 pr-10 bg-gray-100 dark:bg-gray-800 rounded-md" /></div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">كلمة المرور الجديدة</label>
                         <div className="relative"><span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"><KeyIcon className="w-5 h-5"/></span><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full p-2 pr-10 bg-gray-100 dark:bg-gray-800 rounded-md" /></div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">تأكيد كلمة المرور الجديدة</label>
                         <div className="relative"><span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"><KeyIcon className="w-5 h-5"/></span><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full p-2 pr-10 bg-gray-100 dark:bg-gray-800 rounded-md" /></div>
                    </div>
                     <div className="flex justify-end pt-2">
                        <button type="submit" disabled={isPasswordSaving} className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg disabled:bg-gray-400">
                            {isPasswordSaving ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;