/**
 * APP WRAPPER EXAMPLE
 * 
 * This shows how to integrate the language system into your main App.tsx
 * 
 * Use this as a reference to update your actual App.tsx file
 */

import { useEffect, useState } from 'react';
import LanguageInitializer from './components/LanguageInitializer';
import LanguageSelectorUI from './components/LanguageSelectorUI';
import { useTranslation } from 'react-i18next';

/**
 * Main App Content (actual routes and pages go here)
 */
function AppContent() {
  const { t } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {isLoggedIn ? t('dashboard') : t('welcome')}
          </h1>
          <div className="flex items-center gap-4">
            <LanguageSelectorUI />
            {isLoggedIn && (
              <button
                onClick={() => setIsLoggedIn(false)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                {t('logout')}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!isLoggedIn ? (
          // Login Page
          <div className="max-w-md mx-auto bg-white rounded shadow p-6">
            <h2 className="text-2xl font-bold mb-4">{t('login')}</h2>
            <input
              type="email"
              placeholder={t('email')}
              className="w-full px-4 py-2 border rounded mb-4"
            />
            <input
              type="password"
              placeholder={t('password')}
              className="w-full px-4 py-2 border rounded mb-4"
            />
            <button
              onClick={() => setIsLoggedIn(true)}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              {t('login')}
            </button>
          </div>
        ) : (
          // Dashboard
          <div>
            <h2 className="text-2xl font-bold mb-6">{t('dashboard')}</h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded shadow">
                <p className="text-gray-600">{t('orders')}</p>
                <p className="text-3xl font-bold">24</p>
              </div>
              <div className="bg-white p-6 rounded shadow">
                <p className="text-gray-600">{t('products')}</p>
                <p className="text-3xl font-bold">156</p>
              </div>
              <div className="bg-white p-6 rounded shadow">
                <p className="text-gray-600">{t('messages')}</p>
                <p className="text-3xl font-bold">12</p>
              </div>
              <div className="bg-white p-6 rounded shadow">
                <p className="text-gray-600">{t('onlineUsers')}</p>
                <p className="text-3xl font-bold">8</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * Root App Component with Language Initialization
 * 
 * This wraps your app content with the LanguageInitializer
 * which shows the language selection screen on first login
 */
export default function App() {
  const hasSelectedLanguage = localStorage.getItem('hasSelectedLanguage');

  return (
    <LanguageInitializer requiresLanguageSelection={!hasSelectedLanguage}>
      <AppContent />
    </LanguageInitializer>
  );
}

/**
 * INTEGRATION STEPS:
 * 
 * 1. Copy this structure to your actual App.tsx
 * 
 * 2. Replace AppContent with your existing routing logic
 * 
 * 3. Make sure main.tsx imports i18n:
 *    import './i18n';
 * 
 * 4. Use useTranslation() hook in all your pages:
 *    const { t } = useTranslation();
 *    <h1>{t('home')}</h1>
 * 
 * 5. Add LanguageSelectorUI to your header/navbar
 * 
 * 6. Add new translation keys to:
 *    - src/languages/en.json
 *    - src/languages/ta.json
 *    - src/languages/hi.json
 */
