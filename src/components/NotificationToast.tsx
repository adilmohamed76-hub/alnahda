import React, { useEffect, useState } from 'react';
import type { Notification } from '../types/index';
import { InfoIcon, CheckCircleIcon, XCircleIcon, XIcon } from './Icons';

interface NotificationToastProps {
  notification: Notification;
  onClose: (id: number) => void;
  onClick?: () => void;
}

const icons = {
  info: <InfoIcon className="w-6 h-6 text-blue-500" />,
  success: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
  error: <XCircleIcon className="w-6 h-6 text-red-500" />,
};

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose, onClick }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setVisible(true);

    const timer = setTimeout(() => {
      handleClose();
    }, 5000); // 5 seconds duration

    return () => clearTimeout(timer);
  }, [notification.id]);
  
  const handleClose = () => {
     setVisible(false);
     // Wait for animation to finish before removing from DOM
     setTimeout(() => onClose(notification.id), 300);
  }

  const handleClick = () => {
    if (onClick) {
      onClick();
      handleClose();
    }
  };

  const isClickable = !!onClick;

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : -1}
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={isClickable ? (e) => (e.key === 'Enter' || e.key === ' ') && handleClick() : undefined}
      className={`max-w-sm w-full bg-[var(--card-light)] dark:bg-[var(--card-dark)] shadow-2xl rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transition-all duration-300 ease-in-out transform ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      } ${isClickable ? 'cursor-pointer hover:ring-2 hover:ring-[var(--primary-color)]' : ''}`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{icons[notification.type]}</div>
          <div className="mr-3 w-0 flex-1">
            {notification.title && <p className="text-sm font-bold text-gray-900 dark:text-white">{notification.title}</p>}
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{notification.message}</p>
          </div>
          <div className="mr-4 flex-shrink-0 flex items-center">
            <button
              onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
              }}
              className="inline-flex text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
              aria-label="إغلاق الإشعار"
            >
              <span className="sr-only">Close</span>
              <XIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
