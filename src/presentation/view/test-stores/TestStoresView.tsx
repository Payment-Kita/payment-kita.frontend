'use client';

import { 
  useUserStore, 
  useThemeStore, 
  useNotificationStore, 
  useSidebarStore 
} from '@/presentation/hooks';
import { Button, Card, Badge } from '@/presentation/components/atoms';
import { Sun, Moon, Laptop, Bell, User, LogOut, Menu } from 'lucide-react';

export function TestStoresView() {
  const { user, isAuthenticated, logout, setUser } = useUserStore();
  const { theme, setTheme, toggleTheme } = useThemeStore();
  const { toasts, success, error, warning, info, removeToast } = useNotificationStore();
  const { isOpen, toggle } = useSidebarStore();

  // Demo login function
  const handleLogin = () => {
    setUser({
      id: '123',
      email: 'user@example.com',
      name: 'Test User',
      role: 'admin',
    }, 'demo-token-123');
  };

  return (
    <div className="min-h-screen p-6 space-y-6 bg-black text-white rounded-3xl overflow-hidden border border-white/5 shadow-2xl animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black tracking-tight">State Management Audit</h1>
        <Button onClick={toggle} variant="outline" className="rounded-xl border-white/10 hover:bg-white/5">
          <Menu className="h-4 w-4 mr-2" />
          Sidebar: {isOpen ? 'OPEN' : 'CLOSED'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Store */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-md rounded-4xl overflow-hidden">
            <div className="p-8 space-y-4">
            <div className="flex items-center gap-3 text-primary">
                <User className="h-6 w-6" />
                <h2 className="text-xl font-bold italic tracking-wider">User Identity</h2>
            </div>
            {isAuthenticated ? (
                <div className="space-y-6">
                <div className="grid gap-3 p-4 bg-black/40 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted">NAME</span>
                        <span className="font-bold">{user?.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted">EMAIL</span>
                        <span className="font-mono text-[11px] opacity-70">{user?.email}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted">ROLE</span>
                        <Badge variant="success" className="bg-accent-green/10 text-accent-green border-accent-green/20">{user?.role}</Badge>
                    </div>
                </div>
                <Button onClick={logout} variant="danger" className="w-full rounded-xl h-11 shadow-glow-red/10">
                    <LogOut className="h-4 w-4 mr-2" />
                    Terminate Session
                </Button>
                </div>
            ) : (
                <Button onClick={handleLogin} className="w-full h-12 bg-primary hover:bg-primary/80 rounded-2xl font-bold shadow-glow-purple">Authenticate (Demo)</Button>
            )}
            </div>
        </Card>

        {/* Theme Store */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-md rounded-4xl overflow-hidden">
            <div className="p-8 space-y-6">
            <div className="flex items-center gap-3 text-accent-blue">
                {theme === 'dark' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
                <h2 className="text-xl font-bold italic tracking-wider">Interface Theme</h2>
            </div>
            <p className="text-sm font-medium">Mode: <Badge variant="secondary" className="ml-2 px-3 py-1 rounded-lg uppercase text-[10px] tracking-widest">{theme}</Badge></p>
            <div className="grid grid-cols-3 gap-2">
                {[
                    { id: 'light', icon: Sun, label: 'Light' },
                    { id: 'dark', icon: Moon, label: 'Dark' },
                    { id: 'system', icon: Laptop, label: 'System' }
                ].map((item) => (
                    <Button 
                        key={item.id}
                        onClick={() => setTheme(item.id as any)} 
                        variant={theme === item.id ? 'primary' : 'outline'}
                        className={cn(
                            "rounded-xl h-14 flex flex-col items-center justify-center gap-1 transition-all",
                            theme === item.id ? "bg-primary border-primary shadow-glow-purple/20" : "border-white/5 hover:bg-white/5"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
                    </Button>
                ))}
            </div>
            <Button onClick={toggleTheme} variant="ghost" size="sm" className="w-full rounded-lg text-xs hover:bg-white/5">
                Quick Toggle
            </Button>
            </div>
        </Card>
      </div>

      {/* Notification Store */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-md rounded-4xl overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-3 text-warning">
            <Bell className="h-6 w-6" />
            <h2 className="text-xl font-bold italic tracking-wider">Alert System</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button onClick={() => success('Confirmed', 'Action was successful')} variant="success" className="rounded-xl h-12 shadow-glow-green/5">Success</Button>
            <Button onClick={() => error('Error', 'Something went wrong')} variant="danger" className="rounded-xl h-12 shadow-glow-red/5">Critical</Button>
            <Button onClick={() => warning('Wait', 'Check these values')} variant="warning" className="rounded-xl h-12 shadow-glow-orange/5">Warning</Button>
            <Button onClick={() => info('Note', 'System update pending')} variant="secondary" className="rounded-xl h-12">Info</Button>
          </div>
          
          {toasts.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-white/5 animate-slide-up">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted uppercase tracking-[0.2em] opacity-50">Active Stack ({toasts.length})</span>
                <span className="text-[10px] text-primary animate-pulse">MONITORING ACTIVE</span>
              </div>
              <div className="grid gap-3">
                {toasts.map((toast) => (
                  <div key={toast.id} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            toast.type === 'success' ? 'bg-accent-green shadow-glow-green/50' : 
                            toast.type === 'error' ? 'bg-destructive shadow-glow-red/50' :
                            toast.type === 'warning' ? 'bg-warning shadow-glow-orange/50' : 'bg-accent-blue'
                        )} />
                        <div>
                        <p className="text-sm font-bold text-foreground">{toast.title}</p>
                        {toast.description && (
                            <p className="text-[11px] text-muted-foreground italic leading-relaxed">{toast.description}</p>
                        )}
                        </div>
                    </div>
                    <Button 
                      onClick={() => removeToast(toast.id)} 
                      variant="ghost" 
                      size="sm"
                      className="h-8 rounded-lg px-3 text-[10px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity bg-white/5"
                    >
                      Dismiss
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Sidebar Store */}
      <Card className="bg-linear-to-br from-primary/5 to-transparent border-white/10 rounded-4xl">
        <div className="p-8 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold flex items-center gap-2 italic tracking-wider">
                <Layout className="w-5 h-5 text-primary" />
                Sidebar Navigation
                <div className={cn(
                    "ml-2 w-2 h-2 rounded-full",
                    isOpen ? "bg-accent-green" : "bg-muted"
                )} />
            </h2>
            <p className="text-sm text-muted">The sidebar is currently in the <strong>{isOpen ? 'VISIBLE' : 'HIDDEN'}</strong> state.</p>
          </div>
          <Button onClick={toggle} variant="primary" className="rounded-2xl h-12 px-8 font-black shadow-glow-purple">
            {isOpen ? 'COLLAPSE' : 'EXPAND'} CONTROLS
          </Button>
        </div>
      </Card>

      {/* Docs */}
      <Card className="bg-black/60 border-white/5 rounded-4xl p-8">
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Terminal className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">Development Pattern</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Store Access</span>
                    <pre className="p-5 bg-black rounded-3xl border border-white/10 text-[11px] leading-relaxed font-mono text-primary-100">
{`const { user } = useUserStore();
const { success } = useNotificationStore();`}
                    </pre>
                </div>
                <div className="space-y-3">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">UI Consistency</span>
                    <pre className="p-5 bg-black rounded-3xl border border-white/10 text-[11px] leading-relaxed font-mono text-accent-green/80">
{`<Badge variant="success">Active</Badge>
<Button variant="primary">Action</Button>`}
                    </pre>
                </div>
            </div>
        </div>
      </Card>
    </div>
  );
}

function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}

import { Terminal, Layout } from 'lucide-react';
