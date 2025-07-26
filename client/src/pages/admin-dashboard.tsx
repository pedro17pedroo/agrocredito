import { useState } from "react";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sprout, LogOut, Users, FileText, TrendingUp, CheckCircle, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatKwanza, getProjectTypeLabel, getStatusLabel } from "@/lib/angola-utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CreditApplication } from "@shared/schema";

export default function AdminDashboard() {
  const { user } = useAuth();
  const logout = useLogout();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApplication, setSelectedApplication] = useState<CreditApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Verificar se o usuário é admin ou instituição financeira
  if (!user || (user.userType !== "admin" && user.userType !== "financial_institution")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Não tem permissões para aceder a esta página.</p>
        </div>
      </div>
    );
  }

  const { data: allApplications = [], isLoading } = useQuery<CreditApplication[]>({
    queryKey: ["/api/admin/credit-applications"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
      <nav className="bg-agri-dark text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Sprout className="w-8 h-8 mr-3" />
              <span className="text-xl font-bold">Painel Administrativo - AgroCrédito</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="hidden sm:block">{user.fullName}</span>
              <Badge variant="secondary" className="bg-agri-primary">
                {user.userType === "admin" ? "Administrador" : "Instituição Financeira"}
              </Badge>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-agri-dark mb-2">
            Bem-vindo ao Painel Administrativo
          </h1>
          <p className="text-gray-600 text-lg">
            Gerir solicitações de crédito e analisar estatísticas do sistema
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
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
        </div>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-agri-dark">
              Solicitações de Crédito para Análise
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-primary mx-auto mb-4"></div>
                <p className="text-gray-600">A carregar solicitações...</p>
              </div>
            ) : pendingApplications.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">Não há solicitações pendentes para analisar.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Agricultor</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Projeto</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Montante</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Prazo</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Data</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Estado</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pendingApplications.map((application) => {
                      const status = getStatusLabel(application.status || 'pending');
                      
                      return (
                        <tr key={application.id} className="hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div className="font-semibold text-agri-dark">
                              {/* Note: precisamos buscar dados do usuário */}
                              Utilizador {application.userId.slice(-6)}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-semibold text-agri-dark">{application.projectName}</div>
                            <div className="text-sm text-gray-600">
                              {getProjectTypeLabel(application.projectType)}
                            </div>
                          </td>
                          <td className="py-4 px-6 font-semibold text-agri-dark">
                            {formatKwanza(application.amount)}
                          </td>
                          <td className="py-4 px-6 text-gray-600">
                            {application.term} meses
                          </td>
                          <td className="py-4 px-6 text-gray-600">
                            {application.createdAt ? format(new Date(application.createdAt), "dd/MM/yyyy", { locale: ptBR }) : '-'}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.className}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-agri-primary hover:text-agri-dark"
                                    onClick={() => setSelectedApplication(application)}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Ver
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Detalhes da Solicitação</DialogTitle>
                                  </DialogHeader>
                                  
                                  {selectedApplication && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label className="font-semibold">Nome do Projeto</Label>
                                          <p className="text-gray-700">{selectedApplication.projectName}</p>
                                        </div>
                                        <div>
                                          <Label className="font-semibold">Tipo de Projeto</Label>
                                          <p className="text-gray-700">{getProjectTypeLabel(selectedApplication.projectType)}</p>
                                        </div>
                                        <div>
                                          <Label className="font-semibold">Montante Solicitado</Label>
                                          <p className="text-gray-700 font-semibold">{formatKwanza(selectedApplication.amount)}</p>
                                        </div>
                                        <div>
                                          <Label className="font-semibold">Prazo</Label>
                                          <p className="text-gray-700">{selectedApplication.term} meses</p>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <Label className="font-semibold">Descrição do Projeto</Label>
                                        <p className="text-gray-700 mt-1">{selectedApplication.description}</p>
                                      </div>

                                      <div className="flex justify-between pt-4 border-t">
                                        <Button
                                          onClick={() => handleApprove(selectedApplication)}
                                          className="bg-green-600 hover:bg-green-700"
                                          disabled={updateApplicationStatus.isPending}
                                        >
                                          <CheckCircle className="w-4 h-4 mr-2" />
                                          Aprovar
                                        </Button>
                                        
                                        <div className="flex space-x-2">
                                          <div className="space-y-2">
                                            <Label htmlFor="rejectionReason">Motivo da Rejeição</Label>
                                            <Textarea
                                              id="rejectionReason"
                                              value={rejectionReason}
                                              onChange={(e) => setRejectionReason(e.target.value)}
                                              placeholder="Indique o motivo da rejeição..."
                                              className="w-64"
                                            />
                                          </div>
                                          <Button
                                            onClick={() => handleReject(selectedApplication)}
                                            variant="destructive"
                                            disabled={updateApplicationStatus.isPending || !rejectionReason.trim()}
                                          >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Rejeitar
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}