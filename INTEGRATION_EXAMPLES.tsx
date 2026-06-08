/**
 * EXAMPLE: How to integrate i18n in your existing pages
 * Copy patterns from these examples to update your real pages
 */

// ============================================
// EXAMPLE 1: Login Page
// ============================================
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export function LoginPageExample() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('Logging in...');
    // Your login logic
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-6">{t('login')}</h1>
        
        <input
          type="email"
          placeholder={t('email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
        />
        
        <input
          type="password"
          placeholder={t('password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
        />
        
        <div className="flex items-center gap-2 mb-4">
          <input type="checkbox" id="remember" />
          <label htmlFor="remember">{t('rememberMe')}</label>
        </div>
        
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          {t('login')}
        </button>
        
        <p className="text-center mt-4">
          <a href="#" className="text-blue-500 hover:underline">
            {t('forgotPassword')}
          </a>
        </p>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 2: Dashboard Page
// ============================================
export function DashboardExample() {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{t('dashboard')}</h1>
      
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600">{t('orders')}</h3>
          <p className="text-3xl font-bold">24</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600">{t('products')}</h3>
          <p className="text-3xl font-bold">156</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600">{t('payment')}</h3>
          <p className="text-3xl font-bold">₹45,000</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600">{t('onlineUsers')}</h3>
          <p className="text-3xl font-bold">12</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 3: Products Page
// ============================================
interface Product {
  id: string;
  name: string;
  price: number;
}

export function ProductsPageExample({ products }: { products: Product[] }) {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{t('products')}</h1>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder={t('search')}
          className="px-4 py-2 border rounded w-full"
        />
      </div>

      {products.length === 0 ? (
        <p>{t('noData')}</p>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded shadow p-4">
              <h3 className="font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-4">₹{product.price}</p>
              <button className="w-full bg-blue-500 text-white py-2 rounded">
                {t('addToCart')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// EXAMPLE 4: Chat Component
// ============================================
interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

export function ChatComponentExample({ messages }: { messages: Message[] }) {
  const { t } = useTranslation();
  const [messageText, setMessageText] = useState('');

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Send message logic
      setMessageText('');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <h2 className="text-2xl font-bold p-4 border-b">{t('chat')}</h2>
      
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-gray-500">{t('noMessages')}</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="mb-4">
              <p className="font-semibold">{msg.sender}</p>
              <p className="text-gray-700">{msg.text}</p>
              <p className="text-xs text-gray-500">{msg.timestamp}</p>
            </div>
          ))
        )}
      </div>

      <div className="border-t p-4 flex gap-2">
        <input
          type="text"
          placeholder={t('typeMessage')}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-1 px-4 py-2 border rounded"
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          {t('sendMessage')}
        </button>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 5: Settings Page
// ============================================
import LanguageSelectorUI from './LanguageSelectorUI';

export function SettingsPageExample() {
  const { t, i18n } = useTranslation();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{t('settings')}</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">{t('selectLanguage')}</h3>
          <p className="text-gray-600 mb-4">{t('selectLanguageDesc')}</p>
          <LanguageSelectorUI />
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">{t('profile')}</h3>
          <p className="text-gray-600">Current Language: {i18n.language}</p>
          <p className="text-gray-600">Display Language: {i18n.language.toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 6: Role-based Dashboard
// ============================================
export function RoleBasedDashboardExample({ role }: { role: 'admin' | 'farmer' | 'buyer' }) {
  const { t } = useTranslation();

  const dashboardTitles = {
    admin: t('admin_dashboard'),
    farmer: t('farmer_dashboard'),
    buyer: t('buyer_dashboard'),
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{dashboardTitles[role]}</h1>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">{t('myOrders')}</h3>
          <p className="text-3xl font-bold">42</p>
        </div>
        
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">{t('messages')}</h3>
          <p className="text-3xl font-bold">8</p>
        </div>

        <div className="bg-white p-6 rounded shadow col-span-2">
          <h3 className="text-lg font-semibold mb-4">{t('onlineUsers')}</h3>
          <p className="text-gray-600">Connected users: 15</p>
        </div>
      </div>
    </div>
  );
}
