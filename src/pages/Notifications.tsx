import { useStore } from '@/lib/store';

const Notifications = () => {
  const { currentUser, notifications, markNotificationRead } = useStore();
  const myNotifs = notifications.filter(n => currentUser?.role ? n.targetRoles.includes(currentUser.role) : false);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
      {myNotifs.length === 0 ? (
        <p className="text-center py-20 text-muted-foreground">No notifications</p>
      ) : (
        <div className="space-y-3">
          {myNotifs.map(n => (
            <div key={n.id} onClick={() => markNotificationRead(n.id)} className={`glass-card rounded-xl p-4 cursor-pointer transition ${!n.read ? 'border-l-4 border-l-accent' : ''}`}>
              <p className="font-semibold text-foreground">{n.title}</p>
              <p className="text-sm text-muted-foreground">{n.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{n.timestamp}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
