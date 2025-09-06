import React, { useState, useEffect } from 'react';
import { MailIcon, LockClosedIcon, UserCircleIcon, CheckCircleIcon, PhoneIcon, KeyIcon } from './Icons';
import type { SystemSettings } from '../types/index';
import * as apiService from '../services/apiService';


interface AuthScreenProps {
  onLogin: (username: string, password?: string) => Promise<void>;
  onRegister: (name: string, email: string, password: string, phone: string) => Promise<void>;
  systemSettings: SystemSettings;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onRegister, systemSettings }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isForgotModalOpen, setForgotModalOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
        if (isLoginView) {
            if (rememberMe) {
                localStorage.setItem('rememberedUsername', username);
            } else {
                localStorage.removeItem('rememberedUsername');
            }
            await onLogin(username, password);
        } else {
            await onRegister(username, email, password, phone);
        }
    } catch (err) {
        setError((err as Error).message);
    } finally {
        setIsLoading(false);
    }
  };
  
  const closeForgotModal = () => {
    setForgotModalOpen(false);
  };
  
  const ForgotPasswordModal = () => {
    const [step, setStep] = useState(1); // 1: request, 2: verify, 3: reset
    const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [modalError, setModalError] = useState<string|null>(null);
    const [modalLoading, setModalLoading] = useState(false);
    
    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalError(null);
        setModalLoading(true);
        try {
            await apiService.requestRecoveryCode(recoveryIdentifier);
            setStep(2);
        } catch (err) {
            setModalError((err as Error).message);
        } finally {
            setModalLoading(false);
        }
    };
    
    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalError(null);
        setModalLoading(true);
        try {
            await apiService.verifyRecoveryCode(recoveryIdentifier, code);
            setStep(3);
        } catch (err) {
            setModalError((err as Error).message);
        } finally {
            setModalLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalError(null);
        setModalLoading(true);
        try {
            await apiService.resetPassword(recoveryIdentifier, code, newPassword);
            setStep(4); // Success step
        } catch (err) {
            setModalError((err as Error).message);
        } finally {
            setModalLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={closeForgotModal}>
            <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-2xl shadow-2xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
                {step === 1 && (
                    <form onSubmit={handleRequestCode}>
                        <h3 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-2">استعادة كلمة المرور</h3>
                        <p className="text-center text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-6">أدخل اسم المستخدم أو البريد الإلكتروني لإرسال رمز التحقق.</p>
                        {modalError && <p className="text-red-500 text-sm text-center mb-4">{modalError}</p>}
                        
                        <div className="relative">
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"><UserCircleIcon /></span>
                            <input type="text" placeholder="اسم المستخدم أو البريد الإلكتروني" value={recoveryIdentifier} onChange={e => setRecoveryIdentifier(e.target.value)} required aria-label="اسم المستخدم أو البريد الإلكتروني" className="w-full pr-10 pl-4 py-3 text-sm rounded-lg"/>
                        </div>
                        <div className="flex gap-4 mt-6">
                            <button type="button" onClick={closeForgotModal} className="w-full py-2 bg-gray-200 rounded-lg">إلغاء</button>
                            <button type="submit" disabled={modalLoading} className="w-full py-2 bg-blue-500 text-white rounded-lg">{modalLoading ? 'جاري الإرسال...':'إرسال الرمز'}</button>
                        </div>
                    </form>
                )}
                {step === 2 && (
                     <form onSubmit={handleVerifyCode}>
                        <h3 className="text-xl font-bold text-center">التحقق من الرمز</h3>
                        <p className="text-center text-sm text-gray-500 mb-6">تم إرسال رمز مكون من 6 أرقام. يرجى التحقق من بريدك الإلكتروني.</p>
                         {modalError && <p className="text-red-500 text-sm text-center mb-4">{modalError}</p>}
                        <div className="relative">
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"><KeyIcon/></span>
                            <input type="text" placeholder="أدخل الرمز" value={code} onChange={e => setCode(e.target.value)} required maxLength={6} aria-label="رمز التحقق" className="w-full pr-10 pl-4 py-3 text-lg tracking-[0.5em] text-center font-mono rounded-lg"/>
                        </div>
                        <div className="flex gap-4 mt-6">
                            <button type="button" onClick={() => setStep(1)} className="w-full py-2 bg-gray-200 rounded-lg">رجوع</button>
                            <button type="submit" disabled={modalLoading} className="w-full py-2 bg-blue-500 text-white rounded-lg">{modalLoading ? 'جاري التحقق...' : 'تحقق'}</button>
                        </div>
                    </form>
                )}
                {step === 3 && (
                     <form onSubmit={handleResetPassword}>
                        <h3 className="text-xl font-bold text-center">إعادة تعيين كلمة المرور</h3>
                        <p className="text-center text-sm text-gray-500 mb-6">أدخل كلمة مرور جديدة وقوية.</p>
                         {modalError && <p className="text-red-500 text-sm text-center mb-4">{modalError}</p>}
                        <div className="relative">
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"><LockClosedIcon/></span>
                            <input type="password" placeholder="كلمة المرور الجديدة" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} aria-label="كلمة المرور الجديدة" className="w-full pr-10 pl-4 py-3 text-sm rounded-lg"/>
                        </div>
                         <div className="flex gap-4 mt-6">
                            <button type="submit" disabled={modalLoading} className="w-full py-2 bg-blue-500 text-white rounded-lg">{modalLoading ? 'جاري الحفظ...' : 'إعادة التعيين'}</button>
                        </div>
                    </form>
                )}
                 {step === 4 && (
                    <div className="text-center">
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold">تم بنجاح!</h3>
                        <p className="text-sm text-gray-500 mb-6">تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.</p>
                        <button onClick={closeForgotModal} className="w-full py-2 bg-blue-500 text-white rounded-lg">حسنًا</button>
                    </div>
                 )}
            </div>
        </div>
    );
  }

  return (
    <>
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8 h-12">
            {systemSettings.companyLogo ? (
                <img src={systemSettings.companyLogo} alt={systemSettings.companyName} className="h-full object-contain" />
            ) : (
                <>
                    <svg className="w-10 h-10 text-[var(--primary-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 21c0-4 .5-6 4-7 3.5 1 4 3 4 7M12 14v-4m0-4l-3-3m3 3l3-3m-3-3V1M9 7l-2-2m3 2l-1-2m5 2l2-2m-3 2l1-2" />
                    </svg>
                    <span className="mr-3 text-3xl font-bold text-gray-800 dark:text-white">النهضة</span>
                </>
            )}
        </div>
        
        <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-2">
            {isLoginView ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h2>
          <p className="text-center text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-8">
            {isLoginView ? 'مرحباً بعودتك! الرجاء إدخال بياناتك.' : 'أهلاً بك في نظام النهضة! قم بتعبئة البيانات لإنشاء حساب جديد. بعد التسجيل، ستحصل على صلاحيات أساسية، ويمكن لمدير النظام ترقية حسابك.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative text-sm" role="alert">
                <strong className="font-bold">خطأ! </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <div className="relative">
                 <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                    <UserCircleIcon />
                 </span>
                <input type="text" placeholder="اسم المستخدم" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isLoading} className="w-full pr-10 pl-4 py-3 text-sm text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50" required />
            </div>

            {!isLoginView && (
              <div className="relative">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"><MailIcon /></span>
                <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} className="w-full pr-10 pl-4 py-3 text-sm text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50" required={!isLoginView} />
              </div>
            )}

            {!isLoginView && (
                <div className="relative">
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"><PhoneIcon /></span>
                    <input type="tel" placeholder="رقم الهاتف" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isLoading} className="w-full pr-10 pl-4 py-3 text-sm text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50"/>
                </div>
            )}

            <div className="relative">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"><LockClosedIcon /></span>
                <input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className="w-full pr-10 pl-4 py-3 text-sm text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50" required/>
            </div>
            
            {isLoginView && (
                <div className="flex items-center justify-between">
                    <label htmlFor="rememberMe" className="flex items-center text-sm cursor-pointer">
                        <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} disabled={isLoading} className="h-4 w-4 rounded border-gray-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)]"/>
                        <span className="mr-2 text-gray-600 dark:text-gray-400">تذكرني</span>
                    </label>
                    <button type="button" onClick={() => setForgotModalOpen(true)} className="text-sm text-[var(--primary-color)] hover:underline">هل نسيت كلمة المرور؟</button>
                </div>
            )}

            <div>
              <button type="submit" disabled={isLoading} className="w-full py-3 px-4 bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] disabled:bg-gray-400 disabled:cursor-not-allowed">
                {isLoading ? (isLoginView ? 'جاري الدخول...' : 'جاري الإنشاء...') : (isLoginView ? 'تسجيل الدخول' : 'إنشاء حساب')}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
              {isLoginView ? 'ليس لديك حساب؟' : 'هل لديك حساب بالفعل؟'}{' '}
              <button onClick={() => { setIsLoginView(!isLoginView); setError(null); }} className="font-semibold text-[var(--primary-color)] hover:underline focus:outline-none" disabled={isLoading}>
                {isLoginView ? 'إنشاء حساب' : 'تسجيل الدخول'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
    
    {isForgotModalOpen && <ForgotPasswordModal />}
    </>
  );
};

export default AuthScreen;
