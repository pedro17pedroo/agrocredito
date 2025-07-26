import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatKwanza, parseKwanza } from "@/lib/angola-utils";

const applicationSchema = z.object({
  projectName: z.string().min(3, "Nome do projeto deve ter pelo menos 3 caracteres"),
  projectType: z.enum(["corn", "cassava", "cattle", "poultry", "horticulture", "other"]),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  amount: z.string().min(1, "Montante é obrigatório"),
  term: z.string().min(1, "Prazo é obrigatório"),
});

type ApplicationForm = z.infer<typeof applicationSchema>;

export default function CreditApplication() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      projectName: "",
      projectType: "corn",
      description: "",
      amount: "",
      term: "12",
    },
  });

  const createApplication = useMutation({
    mutationFn: async (data: ApplicationForm) => {
      const applicationData = {
        ...data,
        amount: parseKwanza(data.amount).toString(),
        term: parseInt(data.term),
      };
      
      const response = await apiRequest("POST", "/api/credit-applications", applicationData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Solicitação enviada com sucesso!",
        description: "A sua solicitação será analisada em breve.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/credit-applications"] });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao enviar solicitação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ApplicationForm) => {
    createApplication.mutate(data);
  };

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue) {
      const formatted = formatKwanza(parseInt(numericValue));
      form.setValue('amount', formatted);
    } else {
      form.setValue('amount', '');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <Button
            variant="outline"
            onClick={() => setLocation("/dashboard")}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-agri-dark">Nova Solicitação de Crédito</h1>
            <p className="text-gray-600">Preencha os dados do seu projeto agrícola</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-agri-dark">
              <Sprout className="w-6 h-6 mr-2" />
              Detalhes do Projeto Agrícola
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="projectName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="form-label">Nome do Projeto</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="ex: Cultivo de Milho - Malanje"
                            className="form-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="projectType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="form-label">Tipo de Projeto</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="form-input">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="corn">Cultivo de Milho</SelectItem>
                            <SelectItem value="cassava">Cultivo de Mandioca</SelectItem>
                            <SelectItem value="cattle">Criação de Gado</SelectItem>
                            <SelectItem value="poultry">Avicultura</SelectItem>
                            <SelectItem value="horticulture">Horticultura</SelectItem>
                            <SelectItem value="other">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="form-label">Descrição do Projeto</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Descreva detalhadamente o seu projeto agrícola, objetivos e como pretende usar o crédito..."
                          className="min-h-[120px] form-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="form-label">Montante Pretendido</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            placeholder="AOA 5,000,000"
                            className="form-input text-center font-semibold"
                            onChange={(e) => handleAmountChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="term"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="form-label">Prazo (meses)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="form-input">
                              <SelectValue placeholder="Selecione o prazo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="12">12 meses</SelectItem>
                            <SelectItem value="24">24 meses</SelectItem>
                            <SelectItem value="36">36 meses</SelectItem>
                            <SelectItem value="48">48 meses</SelectItem>
                            <SelectItem value="60">60 meses</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/dashboard")}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createApplication.isPending}
                    className="flex-1 bg-agri-primary hover:bg-agri-dark"
                  >
                    {createApplication.isPending ? "Enviando..." : "Enviar Solicitação"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
