import React from 'react';

const About: React.FC = () => {
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">عن البرنامج</h1>
      <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center mb-6">
            <svg className="w-16 h-16 text-[var(--primary-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 21c0-4 .5-6 4-7 3.5 1 4 3 4 7M12 14v-4m0-4l-3-3m3 3l3-3m-3-3V1M9 7l-2-2m3 2l-1-2m5 2l2-2m-3 2l1-2" />
            </svg>
            <span className="mt-4 text-4xl font-bold text-gray-800 dark:text-white">النهضة</span>
        </div>
        <h2 className="text-2xl font-semibold text-center mb-2 text-gray-800 dark:text-white">نظام إدارة الأعمال المتكامل</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">الإصدار 1.0.0 (نسخة سطح المكتب المحلية)</p>

        <div className="text-right space-y-4 text-gray-700 dark:text-gray-300">
            <p>
                <strong>النهضة</strong> هو حل برمجي شامل مصمم لمساعدتك على إدارة جميع جوانب أعمالك بكفاءة وسهولة. تم بناء هذا النظام ليكون قابلاً للاستخدام على جهازك المحلي، مما يضمن سرعة الأداء وأقصى درجات الأمان والخصوصية لبياناتك.
            </p>
            <p>
                من خلال واجهات سهلة الاستخدام، يمكنك إدارة المنتجات والمخزون، تتبع المبيعات والمشتريات، إدارة علاقات العملاء والموردين، والتحكم في صلاحيات المستخدمين، كل ذلك من مكان واحد.
            </p>

            <h3 className="text-xl font-semibold pt-6 border-t border-[var(--border-light)] dark:border-[var(--border-dark)] mt-8">التقنيات المستخدمة</h3>
            <ul className="list-disc list-inside space-y-2 pr-4">
                <li><strong>الواجهة الأمامية (Frontend):</strong> React, TypeScript, Tailwind CSS</li>
                <li><strong>الواجهة الخلفية (Backend):</strong> Node.js, Express.js</li>
                <li><strong>قاعدة البيانات (Database):</strong> SQLite</li>
            </ul>
        </div>
        
        <div className="text-center mt-12 text-xs text-gray-400">
            <p>&copy; {new Date().getFullYear()}. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </>
  );
};

export default About;