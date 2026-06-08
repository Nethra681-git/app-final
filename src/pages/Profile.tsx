import { useStore } from '@/lib/store';
import { User, Phone, Globe, Building, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { t } = useTranslation();
  const { currentUser } = useStore();
  if (!currentUser) return null;

  const fields = [
    { icon: User, label: t('full_name'), value: currentUser.name },
    { icon: ShieldCheck, label: t('role'), value: currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) },
    { icon: Phone, label: t('phone'), value: currentUser.phone || 'N/A' },
    { icon: Globe, label: t('country'), value: currentUser.country },
    { icon: Building, label: t('company_name'), value: 'SHASTIKA GLOBAL IMPEX PRIVATE LIMITED' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">{t('profile')}</h1>
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-4 pb-6 border-b border-border mb-6">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">{currentUser.name[0]}</div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{currentUser.name}</h2>
            <p className="text-sm text-muted-foreground">{currentUser.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs ${currentUser.status === 'approved' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>{currentUser.status}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${currentUser.verified ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>{currentUser.verified ? t('status_verified') : t('status_not_verified')}</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary capitalize">{currentUser.userType}</span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {fields.map(f => (
            <div key={f.label} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <f.icon className="w-4 h-4 text-primary" />
              <div><p className="text-xs text-muted-foreground">{f.label}</p><p className="text-sm font-medium text-foreground">{f.value}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
