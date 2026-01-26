import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Users, 
  LogOut, 
  MapPin,
  Plus,
  ChevronRight,
  History,
  UserCog
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { CitiesSection } from '@/components/admin/CitiesSection';
import { ContributorsSection } from '@/components/admin/ContributorsSection';
import { UsersSection } from '@/components/admin/UsersSection';
import { ActivityLogsSheet } from '@/components/admin/ActivityLogsSheet';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { role, signOut } = useAuth();
  const [logsOpen, setLogsOpen] = useState(false);
  
  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-terracotta" />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold">LocalVia</h1>
              <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setLogsOpen(true)}
              title="Storico attività"
            >
              <History className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="p-4 pb-24">
        <Tabs defaultValue="cities" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="cities" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Città
            </TabsTrigger>
            <TabsTrigger value="contributors" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Inviti
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UserCog className="w-4 h-4" />
              Utenti
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="cities">
            <CitiesSection />
          </TabsContent>
          
          <TabsContent value="contributors">
            <ContributorsSection />
          </TabsContent>
          
          <TabsContent value="users">
            <UsersSection />
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Activity Logs Sheet */}
      <ActivityLogsSheet open={logsOpen} onOpenChange={setLogsOpen} />
    </div>
  );
}
