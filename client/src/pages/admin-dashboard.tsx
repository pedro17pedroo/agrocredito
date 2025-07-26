import { useState } from "react";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Sprout, LogOut, Users, FileText, TrendingUp, CheckCircle, XCircle, Eye, 
  Settings, UserPlus, Shield, BarChart3, CreditCard, Building2, Tractor,
  Menu, X, Home, DollarSign, Edit, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import LoginForm from "@/components/auth/login-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatKwanza, getProjectTypeLabel, getStatusLabel } from "@/lib/angola-utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CreditApplication, User, Profile, Permission } from "@shared/schema";

type AdminSection = 'dashboard' | 'users' | 'applications' | 'accounts' | 'reports' | 'profiles' | 'permissions';

export default function AdminDashboard() {
  const { user } = useAuth();
  const logout = useLogout();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApplication, setSelectedApplication] = useState<CreditApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: '',
    bi: '',
    nif: '',
    phone: '',
    email: '',
    userType: '',
    profileId: ''
  });

  // Move queries outside of conditional logic to avoid hooks error
  const { data: allApplications = [], isLoading } = useQuery<CreditApplication[]>({
    queryKey: ["/api/admin/credit-applications"],
    enabled: !!user && (user.userType === "admin" || user.userType === "financial_institution"),
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && (user.userType === "admin" || user.userType === "financial_institution"),
  });

  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user && (user.userType === "admin" || user.userType === "financial_institution"),
  });

  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: ["/api/admin/profiles"],
    enabled: !!user && (user.userType === "admin" || user.userType === "financial_institution"),
  });

  const { data: permissions = [] } = useQuery<Permission[]>({
    queryKey: ["/api/admin/permissions"],
    enabled: !!user && (user.userType === "admin" || user.userType === "financial_institution"),
  });

  const { data: accounts = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/accounts"],
    enabled: !!user && (user.userType === "admin" || user.userType === "financial_institution"),
  });

  // Show login form if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg border">
            <LoginForm 
              onSuccess={() => {
                // User will be redirected automatically after login
                window.location.reload();
              }}
              onSwitchToRegister={() => {
                // Not needed for admin login
              }}
            />
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Painel Administrativo - AgroCrédito</p>
            <p className="mt-1">Para teste: admin@agricredit.ao / admin123</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has admin permissions
  if (user.userType !== "admin" && user.userType !== "financial_institution") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Não tem permissões para aceder a esta página.</p>
          <Button 
            onClick={() => logout.mutate()}
            variant="outline" 
            className="mt-4"
          >
            Fazer Login com Outra Conta
          </Button>
        </div>
      </div>
    );
  }

  const updateApplicationStatus = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: string; status: string; rejectionReason?: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/credit-applications/${id}/status`, {
        status,
        rejectionReason
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Estado atualizado com sucesso",
        description: "A solicitação foi processada.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/credit-applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setSelectedApplication(null);
      setRejectionReason("");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar estado",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createUser = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      const response = await apiRequest("POST", "/api/admin/users", userData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Utilizador criado com sucesso",
        description: "O novo utilizador foi adicionado ao sistema.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowCreateUserDialog(false);
      setNewUser({
        fullName: '',
        bi: '',
        nif: '',
        phone: '',
        email: '',
        userType: '',
        profileId: ''
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar utilizador",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApprove = (application: CreditApplication) => {
    updateApplicationStatus.mutate({
      id: application.id,
      status: "approved"
    });
  };

  const handleReject = (application: CreditApplication) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Motivo obrigatório",
        description: "Por favor, indique o motivo da rejeição.",
        variant: "destructive",
      });
      return;
    }
    
    updateApplicationStatus.mutate({
      id: application.id,
      status: "rejected",
      rejectionReason
    });
  };

  const handleLogout = () => {
    logout.mutate();
  };

  const pendingApplications = allApplications.filter(app => app.status === "pending");
  const underReviewApplications = allApplications.filter(app => app.status === "under_review");

  const sidebarItems = [
    { id: 'dashboard', label: 'Painel Principal', icon: Home },
    { id: 'users', label: 'Gestão de Utilizadores', icon: Users },
    { id: 'applications', label: 'Solicitações de Crédito', icon: FileText },
    { id: 'accounts', label: 'Contas de Crédito', icon: CreditCard },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'profiles', label: 'Perfis e Permissões', icon: Shield },
  ];

  const renderSidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-agri-dark text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-agri-primary">
        <div className="flex items-center">
          <Sprout className="w-8 h-8 mr-2" />
          <span className="text-lg font-bold">Admin AgroCrédito</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-white hover:bg-agri-primary"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      <nav className="mt-5 px-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "secondary" : "ghost"}
              className={`w-full justify-start mb-1 text-white ${
                activeSection === item.id 
                  ? "bg-agri-primary hover:bg-agri-primary/90" 
                  : "hover:bg-agri-primary/50"
              }`}
              onClick={() => setActiveSection(item.id as AdminSection)}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </nav>
      
      <div className="absolute bottom-4 left-2 right-2">
        <div className="bg-agri-primary/20 rounded-lg p-3 mb-3">
          <div className="text-sm font-medium">{user.fullName}</div>
          <div className="text-xs text-agri-light">{user.email}</div>
          <Badge variant="secondary" className="mt-1 bg-agri-secondary text-agri-dark">
            {user.userType === "admin" ? "Administrador" : "Instituição Financeira"}
          </Badge>
        </div>
        <Button
          variant="ghost"
          className="w-full text-white hover:bg-red-600"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Terminar Sessão
        </Button>
      </div>
    </div>
  );

  const renderCreateUserDialog = () => (
    <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Novo Utilizador</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para criar um novo utilizador no sistema.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input
              id="fullName"
              value={newUser.fullName}
              onChange={(e) => setNewUser(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="Nome completo do utilizador"
            />
          </div>
          <div>
            <Label htmlFor="bi">Bilhete de Identidade</Label>
            <Input
              id="bi"
              value={newUser.bi}
              onChange={(e) => setNewUser(prev => ({ ...prev, bi: e.target.value }))}
              placeholder="000000000LA000"
            />
          </div>
          <div>
            <Label htmlFor="nif">NIF (Opcional)</Label>
            <Input
              id="nif"
              value={newUser.nif}
              onChange={(e) => setNewUser(prev => ({ ...prev, nif: e.target.value }))}
              placeholder="NIF do utilizador"
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={newUser.phone}
              onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+244900000000"
            />
          </div>
          <div>
            <Label htmlFor="email">Email (Opcional)</Label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@exemplo.com"
            />
          </div>
          <div>
            <Label htmlFor="userType">Tipo de Utilizador</Label>
            <Select value={newUser.userType} onValueChange={(value) => setNewUser(prev => ({ ...prev, userType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="farmer">Agricultor</SelectItem>
                <SelectItem value="company">Empresa Agrícola</SelectItem>
                <SelectItem value="cooperative">Cooperativa</SelectItem>
                <SelectItem value="financial_institution">Instituição Financeira</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label htmlFor="profileId">Perfil</Label>
            <Select value={newUser.profileId} onValueChange={(value) => setNewUser(prev => ({ ...prev, profileId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar perfil" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map(profile => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name} - {profile.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={() => setShowCreateUserDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={() => createUser.mutate(newUser)}
            disabled={!newUser.fullName || !newUser.bi || !newUser.phone || !newUser.userType}
          >
            Criar Utilizador
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total de Solicitações</p>
                <p className="text-2xl font-bold text-agri-dark">{allApplications.length}</p>
              </div>
              <FileText className="text-blue-500 w-8 h-8" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pendentes</p>
                <p className="text-2xl font-bold text-agri-dark">{pendingApplications.length}</p>
              </div>
              <FileText className="text-yellow-500 w-8 h-8" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Aprovadas</p>
                <p className="text-2xl font-bold text-agri-dark">
                  {allApplications.filter(app => app.status === "approved").length}
                </p>
              </div>
              <CheckCircle className="text-green-500 w-8 h-8" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Rejeitadas</p>
                <p className="text-2xl font-bold text-agri-dark">
                  {allApplications.filter(app => app.status === "rejected").length}
                </p>
              </div>
              <XCircle className="text-red-500 w-8 h-8" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Utilizadores</p>
                <p className="text-2xl font-bold text-agri-dark">{allUsers.length}</p>
              </div>
              <Users className="text-purple-500 w-8 h-8" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-indigo-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Contas Ativas</p>
                <p className="text-2xl font-bold text-agri-dark">{accounts.length}</p>
              </div>
              <CreditCard className="text-indigo-500 w-8 h-8" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">A carregar...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Montante</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allApplications.slice(0, 5).map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{app.projectName}</div>
                        <div className="text-sm text-gray-500">{getProjectTypeLabel(app.projectType)}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatKwanza(app.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={app.status === 'approved' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'}>
                        {getStatusLabel(app.status || 'pending').label}
                      </Badge>
                    </TableCell>
                    <TableCell>{app.createdAt ? format(new Date(app.createdAt), "dd/MM/yyyy") : '-'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedApplication(app)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderUsersManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão de Utilizadores</h2>
        <Button onClick={() => setShowCreateUserDialog(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Criar Utilizador
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email/Telefone</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUsers.map((userData) => (
                <TableRow key={userData.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{userData.fullName}</div>
                      <div className="text-sm text-gray-500">BI: {userData.bi}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {userData.email && <div>{userData.email}</div>}
                      <div className="text-sm text-gray-500">{userData.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {userData.userType === 'farmer' ? 'Agricultor' :
                       userData.userType === 'company' ? 'Empresa' :
                       userData.userType === 'cooperative' ? 'Cooperativa' :
                       userData.userType === 'financial_institution' ? 'Inst. Financeira' :
                       'Administrador'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={userData.isActive ? 'default' : 'secondary'}>
                      {userData.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {userData.createdAt ? format(new Date(userData.createdAt), "dd/MM/yyyy") : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {renderCreateUserDialog()}
    </div>
  );

  const renderProfilesManagement = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gestão de Perfis e Permissões</h2>
      
      <Tabs defaultValue="profiles">
        <TabsList>
          <TabsTrigger value="profiles">Perfis</TabsTrigger>
          <TabsTrigger value="permissions">Permissões</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profiles">
          <Card>
            <CardHeader>
              <CardTitle>Perfis do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Sistema</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">{profile.name}</TableCell>
                      <TableCell>{profile.description}</TableCell>
                      <TableCell>
                        <Badge variant={profile.isActive ? 'default' : 'secondary'}>
                          {profile.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {profile.isSystem && <Badge variant="outline">Sistema</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          {!profile.isSystem && (
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Permissões do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">{permission.name}</TableCell>
                      <TableCell>{permission.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{permission.module}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{permission.action}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUsersManagement();
      case 'applications':
        return renderDashboard(); // For now, show dashboard for applications
      case 'accounts':
        return renderDashboard(); // For now, show dashboard for accounts  
      case 'reports':
        return renderDashboard(); // For now, show dashboard for reports
      case 'profiles':
        return renderProfilesManagement();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      {renderSidebar()}
      
      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-xl font-semibold text-gray-900">
                {sidebarItems.find(item => item.id === activeSection)?.label || 'Painel Administrativo'}
              </h1>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-4 py-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}