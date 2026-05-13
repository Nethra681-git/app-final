import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { Eye, EyeOff } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { useStore, type UserRole } from '@/lib/store';
import { countries, phoneFormats } from '@/lib/countries';
import logo from '@/assets/logo.webp';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const LOGIN_ROLES: { value: UserRole; label: string; emoji: string; desc: string }[] = [
  { value: 'buyer',  label: 'Buyer',  emoji: '🛒', desc: 'Purchase agricultural products' },
  { value: 'farmer', label: 'Farmer', emoji: '🌾', desc: 'Sell your farm produce' },
  { value: 'admin',  label: 'Admin',  emoji: '🛡️', desc: 'Manage the platform' },
];

const isAndroid = /android/i.test(navigator.userAgent); // ✅ Android check

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setCurrentUser, users, addUser } = useStore();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [role, setRole] = useState<UserRole>('buyer');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [showGoogleRoleModal, setShowGoogleRoleModal] = useState(false);
  const [googleRoleSelected, setGoogleRoleSelected] = useState<UserRole>('buyer');
  const [loginRole, setLoginRole] = useState<UserRole>('buyer');
  const [showRoleSelect, setShowRoleSelect] = useState(false);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    setShowRoleSelect(isValidEmail);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (isSignup) {
      if (!name.trim()) e.name = t('nameRequired');
      else if (/\d/.test(name)) e.name = t('nameCannotContainNumbers');
      if (!phone) e.phone = t('phoneRequired');
      else if (!/^\d+$/.test(phone)) e.phone = t('phoneMustBeNumeric');
      else {
        const fmt = phoneFormats[country];
        if (fmt && phone.length !== fmt.digits) e.phone = `Must be ${fmt.digits} digits for ${country}`;
      }
      if (!country) e.country = t('countryRequired');
      if (!password) e.password = t('passwordRequired');
      else if (password.length < 6) e.password = `${t('minimumCharacters')}`;
    }
    if (!email) e.email = t('emailAddress');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = t('invalidEmailFormat');
    if (!isSignup && !password) e.password = t('passwordRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    if (email === 'kim.swathi.07@gmail.com' && password === 'swathi123') {
      setCurrentUser({
        id: 'admin', name: 'Admin', email, phone: '',
        country: 'India', role: 'admin', status: 'approved',
        userType: 'domestic', verified: true
      });
      setSuccessMsg(`✅ Welcome, Admin!`);
      setTimeout(() => navigate('/dashboard'), 1000);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const actualRole = userData.role || loginRole;
        setCurrentUser({
          id: firebaseUser.uid,
          name: userData.name || firebaseUser.displayName || email.split('@')[0],
          email: userData.email || firebaseUser.email || email,
          phone: userData.phone || '',
          country: userData.country || 'India',
          role: actualRole,
          status: userData.status || 'pending',
          userType: userData.userType || 'domestic',
          verified: true
        });
        const roleLabel = LOGIN_ROLES.find(r => r.value === actualRole)?.label || actualRole;
        setSuccessMsg(`✅ Welcome back, ${roleLabel}!`);
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setErrors({ email: 'User profile not found. Please sign up first.' });
      }
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') setErrors({ email: 'Email not registered. Please sign up.' });
      else if (error.code === 'auth/wrong-password') setErrors({ password: t('login_wrong_password') });
      else if (error.code === 'auth/invalid-email') setErrors({ email: t('login_invalid_email') });
      else if (error.code === 'auth/too-many-requests') setErrors({ email: t('login_too_many_attempts') });
      else setErrors({ email: error.message || t('login_failed') });
    }
  };

  const handleSignup = async () => {
    if (!validate()) return;
    if (users.find(u => u.email === email)) { setErrors({ email: 'Email already registered' }); return; }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const userType = (country === 'India' ? 'domestic' : 'international') as import('@/lib/store').UserType;
      const newUser = {
        id: firebaseUser.uid, name, email, phone, country, role,
        status: 'pending' as const, userType, verified: false
      };
      addUser(newUser);
      await setDoc(doc(db, 'users', firebaseUser.uid), { ...newUser, createdAt: new Date().toISOString() });
      setSuccessMsg(t('login_account_created'));
      setTimeout(() => {
        setEmail(''); setPassword(''); setName('');
        setPhone(''); setCountry(''); setIsSignup(false);
      }, 2000);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') setErrors({ email: 'Email already registered' });
      else if (error.code === 'auth/weak-password') setErrors({ password: 'Password is too weak. Use at least 6 characters.' });
      else if (error.code === 'auth/invalid-email') setErrors({ email: 'Invalid email format' });
      else setErrors({ email: error.message || 'Signup failed. Please try again.' });
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { isSignup ? handleSignup() : handleLogin(); }
  };

  const handleGoogleSignIn = async () => {
    setShowGoogleRoleModal(false);
    try {
      setGoogleLoading(true);
      setGoogleError('');
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;
      const userRef = doc(db, 'users', googleUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setCurrentUser({
          id: googleUser.uid,
          name: userData.name || googleUser.displayName || '',
          email: userData.email || googleUser.email || '',
          phone: userData.phone || '',
          country: userData.country || 'India',
          role: userData.role || googleRoleSelected,
          status: userData.status || 'pending',
          userType: userData.userType || 'domestic',
          verified: true
        });
      } else {
        const newUserData = {
          id: googleUser.uid,
          name: googleUser.displayName || '',
          email: googleUser.email || '',
          phone: '',
          country: 'India',
          role: googleRoleSelected,
          status: 'pending' as const,
          userType: 'domestic' as const,
          verified: true,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', googleUser.uid), newUserData);
        addUser(newUserData);
        setCurrentUser(newUserData);
      }
      navigate('/dashboard');
    } catch (error: any) {
      setGoogleError(error.message || 'Google Sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const inputStyle = { boxShadow: '0 0 20px rgba(34, 197, 94, 0)' };
  const focusStyle = '0 0 20px rgba(34, 197, 94, 0.2)';
  const inputClass = "w-full px-4 py-3 border-2 border-primary/30 rounded-xl bg-background/50 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-0 outline-none transition";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <LanguageSwitcher />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-30"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl opacity-20"></div>
      <div className="w-full max-w-md rounded-2xl p-8 animate-fade-in shadow-2xl border border-primary/20 relative z-10"
        style={{ backgroundColor: 'hsl(var(--card))' }} onKeyDown={onKeyDown}>
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 shadow-2xl"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))', boxShadow: '0 0 30px hsla(var(--primary), 0.4)' }}>
            <img src={logo} alt="Shastika Global" className="w-12 h-12 object-contain filter brightness-0 invert" />
          </div>
          <h1 className="text-4xl font-bold text-foreground text-center mb-2">{t('shastika')}</h1>
          <p className="text-center text-sm text-muted-foreground font-medium tracking-wide">{t('globalImpex')}</p>
        </div>

        {googleLoading && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 text-sm text-center text-muted-foreground animate-pulse">
            Signing in with Google...
          </div>
        )}
        {successMsg && (
          <div className="bg-primary/20 border border-primary/30 text-secondary rounded-xl p-4 mb-6 text-sm font-medium shadow-lg text-center">
            {successMsg}
          </div>
        )}

        {isSignup ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">{t('fullName')} *</label>
              <input className={inputClass} style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder={t('fullName')}
                onFocus={e => e.currentTarget.style.boxShadow = focusStyle} onBlur={e => e.currentTarget.style.boxShadow = inputStyle.boxShadow} />
              {errors.name && <p className="text-destructive text-xs mt-1.5 font-medium">{errors.name}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">{t('emailAddress')} *</label>
              <input type="email" className={inputClass} style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                onFocus={e => e.currentTarget.style.boxShadow = focusStyle} onBlur={e => e.currentTarget.style.boxShadow = inputStyle.boxShadow} />
              {errors.email && <p className="text-destructive text-xs mt-1.5 font-medium">{errors.email}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">{t('country')} *</label>
              <select className={inputClass} style={inputStyle} value={country} onChange={e => setCountry(e.target.value)}
                onFocus={e => e.currentTarget.style.boxShadow = focusStyle} onBlur={e => e.currentTarget.style.boxShadow = inputStyle.boxShadow}>
                <option value="" className="bg-background">{t('selectYourCountry')}</option>
                {countries.map(c => <option key={c} value={c} className="bg-background">{c}</option>)}
              </select>
              {errors.country && <p className="text-destructive text-xs mt-1.5 font-medium">{errors.country}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">{t('phoneNumber')} *</label>
              <input className={inputClass} style={inputStyle} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder={phoneFormats[country] ? `${phoneFormats[country].digits} digits` : t('phoneNumber')}
                onFocus={e => e.currentTarget.style.boxShadow = focusStyle} onBlur={e => e.currentTarget.style.boxShadow = inputStyle.boxShadow} />
              {errors.phone && <p className="text-destructive text-xs mt-1.5 font-medium">{errors.phone}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">{t('role')} *</label>
              <select className={inputClass} style={inputStyle} value={role} onChange={e => setRole(e.target.value as UserRole)}
                onFocus={e => e.currentTarget.style.boxShadow = focusStyle} onBlur={e => e.currentTarget.style.boxShadow = inputStyle.boxShadow}>
                <option value="farmer" className="bg-background">{t('farmer')}</option>
                <option value="buyer" className="bg-background">{t('buyer')}</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">{t('password')} *</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} className={`${inputClass} pr-12`} style={inputStyle} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder={t('minimumCharacters')}
                  onFocus={e => e.currentTarget.style.boxShadow = focusStyle} onBlur={e => e.currentTarget.style.boxShadow = inputStyle.boxShadow} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs mt-1.5 font-medium">{errors.password}</p>}
            </div>
            <button onClick={handleSignup} className="w-full py-3 rounded-xl font-bold mt-6 text-foreground transition transform hover:scale-105"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))', boxShadow: '0 0 30px rgba(34, 197, 94, 0.3)', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              {t('createAccount')}
            </button>
            <p className="text-center text-sm text-muted-foreground">
              {t('alreadyHaveAccount')}{' '}
              <button onClick={() => setIsSignup(false)} className="text-primary font-semibold hover:text-secondary transition">{t('signIn')}</button>
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">{t('emailAddress')}</label>
              <input type="email" className={inputClass} style={inputStyle} value={email}
                onChange={e => handleEmailChange(e.target.value)} placeholder="you@example.com"
                onFocus={e => e.currentTarget.style.boxShadow = focusStyle} onBlur={e => e.currentTarget.style.boxShadow = inputStyle.boxShadow} />
              {errors.email && <p className="text-destructive text-xs mt-1.5 font-medium">{errors.email}</p>}
            </div>

            {showRoleSelect && (
              <div className="animate-fade-in">
                <label className="text-sm font-semibold text-foreground mb-2 block">I am a... <span className="text-primary">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {LOGIN_ROLES.map(r => (
                    <button key={r.value} type="button" onClick={() => setLoginRole(r.value)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center
                        ${loginRole === r.value ? 'border-primary bg-primary/15 shadow-md scale-105' : 'border-primary/20 bg-background/50 hover:border-primary/50 hover:bg-primary/5'}`}>
                      <span className="text-2xl">{r.emoji}</span>
                      <span className={`text-xs font-bold ${loginRole === r.value ? 'text-primary' : 'text-foreground'}`}>{r.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">{LOGIN_ROLES.find(r => r.value === loginRole)?.desc}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">{t('password')}</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} className={`${inputClass} pr-12`} style={inputStyle} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  onFocus={e => e.currentTarget.style.boxShadow = focusStyle} onBlur={e => e.currentTarget.style.boxShadow = inputStyle.boxShadow} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs mt-1.5 font-medium">{errors.password}</p>}
            </div>

            <button onClick={handleLogin} className="w-full py-3 rounded-xl font-bold text-foreground transition transform hover:scale-105"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))', boxShadow: '0 0 30px rgba(34, 197, 94, 0.3)', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              {t('signIn')}
            </button>

            {googleError && (
              <div className="bg-destructive/20 border border-destructive/40 text-secondary rounded-xl p-4 text-sm font-medium text-center">
                {googleError}
              </div>
            )}

            {/* ✅ Android-ல் Google button hide */}
            {!isAndroid && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/40"></div></div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 text-muted-foreground font-medium" style={{ backgroundColor: 'hsl(var(--card))' }}>{t('orContinueWith')}</span>
                  </div>
                </div>
                <button onClick={() => setShowGoogleRoleModal(true)} disabled={googleLoading}
                  className="w-full border-2 border-primary/30 py-3 rounded-xl font-semibold text-foreground hover:border-primary/60 hover:bg-primary/5 transition flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  {googleLoading ? 'Signing in...' : t('continueWithGoogle')}
                </button>
              </>
            )}

            <p className="text-center text-sm text-muted-foreground mt-6">
              {t('dontHaveAccount')}{' '}
              <button onClick={() => setIsSignup(true)} className="text-primary font-semibold hover:text-secondary transition">{t('signUp')}</button>
            </p>
          </div>
        )}
      </div>

      {showGoogleRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 border border-primary/30 shadow-2xl animate-fade-in" style={{ backgroundColor: 'hsl(var(--card))' }}>
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">🔐</div>
              <h2 className="text-xl font-bold text-foreground">Sign in as...</h2>
              <p className="text-sm text-muted-foreground mt-1">Choose your role before continuing with Google</p>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {LOGIN_ROLES.map(r => (
                <button key={r.value} onClick={() => setGoogleRoleSelected(r.value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all
                    ${googleRoleSelected === r.value ? 'border-primary bg-primary/15 shadow-md scale-105' : 'border-primary/20 bg-background/50 hover:border-primary/50'}`}>
                  <span className="text-2xl">{r.emoji}</span>
                  <span className={`text-xs font-bold ${googleRoleSelected === r.value ? 'text-primary' : 'text-foreground'}`}>{r.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mb-5">{LOGIN_ROLES.find(r => r.value === googleRoleSelected)?.desc}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowGoogleRoleModal(false)}
                className="flex-1 py-2.5 rounded-xl border-2 border-primary/20 text-muted-foreground hover:bg-muted transition text-sm font-medium">
                Cancel
              </button>
              <button onClick={handleGoogleSignIn}
                className="flex-1 py-2.5 rounded-xl font-bold text-foreground transition flex items-center justify-center gap-2 text-sm"
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))' }}>
                Continue as {LOGIN_ROLES.find(r => r.value === googleRoleSelected)?.label}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;