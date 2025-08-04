import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatKwanza, formatDate } from "@/lib/angola-utils";
import { 
  Eye, 
  Check, 
  X, 
  Clock, 
  DollarSign, 
  FileText, 
  TrendingUp,
  CreditCard
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface CreditApplication {
  id: string;
  userId: string;
  projectName: string;
  projectType: string;
  description: string;
  amount: string;
  term: number;
  status: "pending" | "under_review" | "approved" | "rejected";
  rejectionReason?: string;
  reviewedBy?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
  };
}

interface Account {
  id: string;
  applicationId: string;
  userId: string;
  financialInstitutionId: string;
  totalAmount: string;
  outstandingBalance: string;
  monthlyPayment: string;
  nextPaymentDate: string;
  isActive: boolean;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
  };
}

interface ApplicationsData {
  new: CreditApplication[];
  underReview: CreditApplication[];
  historical: CreditApplication[];
}

export default function CreditApplicationsView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedApplication, setSelectedApplication] = useState<CreditApplication | null>(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Query for credit applications
  const { data: applicationsData, isLoading: applicationsLoading } = useQuery<ApplicationsData>({
    queryKey: ["/api/admin/credit-applications"],
  });

  // Query for accounts (approved credits)
  const { data: accounts = [], isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ["/api/admin/accounts"],
  });

  // Mutation to update application status
  const updateApplicationStatus = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { 
      id: string; 
      status: string; 
      rejectionReason?: string;
    }) => {
      return apiRequest(`/api/admin/credit-applications/${id}/status`, "PATCH", {
        status,
        rejectionReason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/credit-applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounts"] });
      setShowApplicationDetails(false);
      setSelectedApplication(null);
      setRejectionReason("");
      toast({
        title: "Sucesso",
        description: "Estado da solicitação atualizado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar estado da solicitação",
        variant: "destructive",
      });
    },
  });

  if (applicationsLoading || accountsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-lg">A carregar solicitações...</p>
        </div>
      </div>
    );
  }

  const newApplications = applicationsData?.new || [];
  const underReviewApplications = applicationsData?.underReview || [];
  const historicalApplications = applicationsData?.historical || [];
  const approvedCredits = accounts;

  const statusLabels = {
    pending: "Pendente",
    under_review: "Em Análise",
    approved: "Aprovada",
    rejected: "Rejeitada",
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    under_review: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  const projectTypeLabels = {
    corn: "Milho",
    cassava: "Mandioca",
    cattle: "Pecuária",
    poultry: "Avicultura",
    horticulture: "Horticultura",
    other: "Outro",
  };

  const handleViewApplication = (application: CreditApplication) => {
    setSelectedApplication(application);
    setShowApplicationDetails(true);
    setRejectionReason("");
  };

  const handleApprove = (application: CreditApplication) => {
    updateApplicationStatus.mutate({
      id: application.id,
      status: "approved",
    });
  };

  const handleReject = (application: CreditApplication) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, indique o motivo da rejeição",
        variant: "destructive",
      });
      return;
    }

    updateApplicationStatus.mutate({
      id: application.id,
      status: "rejected",
      rejectionReason: rejectionReason.trim(),
    });
  };

  const handleStartReview = (application: CreditApplication) => {
    updateApplicationStatus.mutate({
      id: application.id,
      status: "under_review",
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novas Solicitações</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newApplications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{underReviewApplications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créditos Geridos</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCredits.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Gerido</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatKwanza(
                approvedCredits.reduce((sum, account) => sum + parseFloat(account.totalAmount), 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="new" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="new">
            Novas Solicitações ({newApplications.length})
          </TabsTrigger>
          <TabsTrigger value="review">
            Em Análise ({underReviewApplications.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Créditos Aprovados ({approvedCredits.length})
          </TabsTrigger>
          <TabsTrigger value="historical">
            Histórico ({historicalApplications.length})
          </TabsTrigger>
        </TabsList>

        {/* New Applications */}
        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Novas Solicitações de Crédito</CardTitle>
              <CardDescription>
                Solicitações aguardando análise de uma instituição financeira
              </CardDescription>
            </CardHeader>
            <CardContent>
              {newApplications.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Não há novas solicitações para analisar.
                </p>
              ) : (
                <div className="space-y-4">
                  {newApplications.map((application) => (
                    <div key={application.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{application.projectName}</h3>
                            <Badge className={statusColors[application.status]}>
                              {statusLabels[application.status]}
                            </Badge>
                            <Badge variant="outline">
                              {projectTypeLabels[application.projectType as keyof typeof projectTypeLabels]}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Valor:</strong> {formatKwanza(parseFloat(application.amount))}</p>
                            <p><strong>Prazo:</strong> {application.term} meses</p>
                            <p><strong>Solicitado em:</strong> {formatDate(application.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewApplication(application)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalhes
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleStartReview(application)}
                            disabled={updateApplicationStatus.isPending}
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Analisar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Under Review Applications */}
        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações em Análise</CardTitle>
              <CardDescription>
                Solicitações que está a analisar atualmente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {underReviewApplications.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Não há solicitações em análise no momento.
                </p>
              ) : (
                <div className="space-y-4">
                  {underReviewApplications.map((application) => (
                    <div key={application.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{application.projectName}</h3>
                            <Badge className={statusColors[application.status]}>
                              {statusLabels[application.status]}
                            </Badge>
                            <Badge variant="outline">
                              {projectTypeLabels[application.projectType as keyof typeof projectTypeLabels]}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Valor:</strong> {formatKwanza(parseFloat(application.amount))}</p>
                            <p><strong>Prazo:</strong> {application.term} meses</p>
                            <p><strong>Em análise desde:</strong> {formatDate(application.updatedAt)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewApplication(application)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approved Credits */}
        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Créditos Aprovados e Geridos</CardTitle>
              <CardDescription>
                Contas de crédito que aprovou e está a gerir
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approvedCredits.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Ainda não aprovou nenhum crédito.
                </p>
              ) : (
                <div className="space-y-4">
                  {approvedCredits.map((account) => (
                    <div key={account.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">
                              {account.user?.fullName || "Cliente"}
                            </h3>
                            <Badge className="bg-green-100 text-green-800">
                              Ativo
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Valor Total:</strong> {formatKwanza(parseFloat(account.totalAmount))}</p>
                            <p><strong>Saldo Devedor:</strong> {formatKwanza(parseFloat(account.outstandingBalance))}</p>
                            <p><strong>Prestação Mensal:</strong> {formatKwanza(parseFloat(account.monthlyPayment))}</p>
                            <p><strong>Próximo Pagamento:</strong> {formatDate(account.nextPaymentDate)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Conta
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historical Applications */}
        <TabsContent value="historical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Decisões</CardTitle>
              <CardDescription>
                Todas as solicitações já analisadas e decididas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historicalApplications.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Ainda não tomou decisões sobre solicitações.
                </p>
              ) : (
                <div className="space-y-4">
                  {historicalApplications.map((application) => (
                    <div key={application.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{application.projectName}</h3>
                            <Badge className={statusColors[application.status]}>
                              {statusLabels[application.status]}
                            </Badge>
                            <Badge variant="outline">
                              {projectTypeLabels[application.projectType as keyof typeof projectTypeLabels]}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Valor:</strong> {formatKwanza(parseFloat(application.amount))}</p>
                            <p><strong>Prazo:</strong> {application.term} meses</p>
                            <p><strong>Decisão em:</strong> {formatDate(application.updatedAt)}</p>
                            {application.rejectionReason && (
                              <p><strong>Motivo da rejeição:</strong> {application.rejectionReason}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewApplication(application)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Application Details Dialog */}
      <Dialog open={showApplicationDetails} onOpenChange={setShowApplicationDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Solicitação</DialogTitle>
            <DialogDescription>
              Informações completas sobre a solicitação de crédito
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Projeto</h4>
                  <p className="text-sm text-gray-600">{selectedApplication.projectName}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Tipo</h4>
                  <Badge variant="outline">
                    {projectTypeLabels[selectedApplication.projectType as keyof typeof projectTypeLabels]}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Valor Solicitado</h4>
                  <p className="text-sm text-gray-600">
                    {formatKwanza(parseFloat(selectedApplication.amount))}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Prazo</h4>
                  <p className="text-sm text-gray-600">{selectedApplication.term} meses</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Descrição do Projeto</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{selectedApplication.description}</p>
              </div>

              <Separator />

              {/* Cliente Information */}
              {selectedApplication.user && (
                <>
                  <div>
                    <h4 className="font-medium mb-2">Dados do Cliente</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Nome:</p>
                        <p className="text-gray-600">{selectedApplication.user.fullName}</p>
                      </div>
                      <div>
                        <p className="font-medium">Telefone:</p>
                        <p className="text-gray-600">{selectedApplication.user.phone}</p>
                      </div>
                      {selectedApplication.user.email && (
                        <div className="col-span-2">
                          <p className="font-medium">Email:</p>
                          <p className="text-gray-600">{selectedApplication.user.email}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              <div>
                <h4 className="font-medium mb-2">Estado Atual</h4>
                <Badge className={statusColors[selectedApplication.status]}>
                  {statusLabels[selectedApplication.status]}
                </Badge>
              </div>

              {selectedApplication.status === "under_review" && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Rejeitar Solicitação</h4>
                    <Textarea
                      placeholder="Indique o motivo da rejeição..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="min-h-20"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowApplicationDetails(false)}>
              Fechar
            </Button>
            {selectedApplication?.status === "under_review" && (
              <>
                <Button
                  variant="default"
                  onClick={() => selectedApplication && handleApprove(selectedApplication)}
                  disabled={updateApplicationStatus.isPending}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Aprovar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => selectedApplication && handleReject(selectedApplication)}
                  disabled={updateApplicationStatus.isPending || !rejectionReason.trim()}
                >
                  <X className="h-4 w-4 mr-1" />
                  Rejeitar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}