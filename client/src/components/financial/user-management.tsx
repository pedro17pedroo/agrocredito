import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  UserPlus, 
  Search,
  Building2,
  Shield
} from "lucide-react";

export default function UserManagement() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Utilizadores</h2>
          <p className="text-gray-600">Gerir clientes e equipa da instituição</p>
        </div>
        <Button className="bg-agri-primary hover:bg-agri-dark">
          <UserPlus className="w-4 h-4 mr-2" />
          Adicionar Utilizador
        </Button>
      </div>

      {/* Coming Soon Notice */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-agri-light rounded-full flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-agri-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Gestão de Utilizadores
              </h3>
              <p className="text-gray-600 max-w-md">
                Esta funcionalidade estará disponível em breve. Permitirá gerir:
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mt-6 max-w-2xl">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-5 h-5 text-agri-primary" />
                  <h4 className="font-medium">Equipa Interna</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Gestores de conta</li>
                  <li>• Analistas de crédito</li>
                  <li>• Administradores</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-agri-primary" />
                  <h4 className="font-medium">Clientes</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Visualizar perfis</li>
                  <li>• Histórico de créditos</li>
                  <li>• Comunicação direta</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-agri-primary" />
                  <h4 className="font-medium">Permissões</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Controlo de acesso</li>
                  <li>• Níveis de autorização</li>
                  <li>• Auditoria de ações</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Search className="w-5 h-5 text-agri-primary" />
                  <h4 className="font-medium">Pesquisa Avançada</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Filtros personalizados</li>
                  <li>• Exportação de dados</li>
                  <li>• Relatórios detalhados</li>
                </ul>
              </div>
            </div>
            
            <div className="pt-4">
              <Badge variant="outline" className="text-agri-primary border-agri-primary">
                Em Desenvolvimento
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Preview */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Funcionalidades Previstas</CardTitle>
            <CardDescription>
              O que estará disponível na gestão de utilizadores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-agri-primary rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Perfis Detalhados</h4>
                <p className="text-sm text-gray-600">
                  Visualizar informações completas dos clientes e histórico de transações
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-agri-primary rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Gestão de Equipa</h4>
                <p className="text-sm text-gray-600">
                  Adicionar e gerir membros da equipa com diferentes níveis de acesso
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-agri-primary rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Comunicação Integrada</h4>
                <p className="text-sm text-gray-600">
                  Sistema de mensagens e notificações diretas com clientes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Benefícios</CardTitle>
            <CardDescription>
              Como esta funcionalidade irá ajudar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Maior Eficiência</h4>
                <p className="text-sm text-gray-600">
                  Centralizar toda a gestão de utilizadores numa só plataforma
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Melhor Atendimento</h4>
                <p className="text-sm text-gray-600">
                  Acesso rápido a informações para melhor servir os clientes
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Controlo Total</h4>
                <p className="text-sm text-gray-600">
                  Monitorizar e controlar todos os acessos e permissões
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}