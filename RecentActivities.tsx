import React, { useState } from 'react';
import type { Activity, Notification } from './types';

const initialActivities: Activity[] = [
  {
    id: 1,
    user: { name: 'فاطمة الزهراء', avatar: 'https://picsum.photos/100/101' },
    action: 'أضافت طلب شراء جديد',
    target: '#PO-2024-076',
    timestamp: 'منذ 5 دقائق',
  },
  {
    id: 2,
    user: { name: 'محمد عبدالله', avatar: 'https://picsum.photos/100/102' },
    action: 'وافق على فاتورة المبيعات',
    target: '#INV-2024-112',
    timestamp: 'منذ 20 دقيقة',
  },
  {
    id: 3,
    user: { name: 'أحمد خالد', avatar: 'https://picsum.photos/100/103' },
    action: 'أغلق مهمة في قسم الموارد البشرية',
    target: 'تعيين موظف جديد',
    timestamp: 'منذ ساعة',
  },
   {
    id: 4,
    user: { name: 'نورة سعد', avatar: 'https://picsum.photos/100/104' },
    action: 'حدّثت حالة المخزون للمنتج',
    target: 'SKU-00125',
    timestamp: 'منذ 3 ساعات',
  },
];

interface RecentActivitiesProps {
  addNotification: (notification: Omit<Notification, 'id'>) => void;
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ addNotification }) => {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);

  const simulateNewActivity = () => {
    const newActivity: Activity = {
        id: Date.now(),
        user: { name: 'علي الأحمد', avatar: 'https://picsum.photos/100/100' },
        action: 'قام بتحديث ملف موظف',
        target: 'ID-8876',
        timestamp: 'الآن',
    };

    setActivities(prev => [newActivity, ...prev]);

    addNotification({
        type: 'success',
        title: 'نشاط جديد',
        message: `${newActivity.user.name} ${newActivity.action}: ${newActivity.target}`,
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">أحدث الأنشطة</h2>
        <button
          onClick={simulateNewActivity}
          className="px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)]"
        >
          محاكاة نشاط جديد
        </button>
      </div>
      <div className="space-y-2">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-reverse space-x-4 p-3 rounded-lg hover:bg-gray-500/5">
            <img src={activity.user.avatar} alt={activity.user.name} className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-semibold text-gray-900 dark:text-white">{activity.user.name}</span>
                <span className="text-gray-500 dark:text-gray-400"> {activity.action} </span>
                <span className="font-medium text-[var(--primary-color)]">{activity.target}</span>
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default RecentActivities;