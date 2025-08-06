import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calculator } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatKwanza, parseKwanza } from "@/lib/angola-utils";
import FinancialInstitutionSelector from "./financial-institution-selector";

const simulatorSchema = z.object({
  amount: z.string().min(1, "Montante é obrigatório"),
  term: z.string().min(1, "Prazo é obrigatório"),
  projectType: z.enum(["corn", "cassava", "cattle", "poultry", "horticulture", "other"]),
});

type SimulatorForm = z.infer<typeof simulatorSchema>;

interface SimulationResult {
  monthlyPayment: number;
  totalAmount: number;
  interestRate: number;
  totalInterest: number;
}

interface CreditProgram {
  id: string;
  name: string;
  description: string;
  projectTypes: string[];
  minAmount: string;
  maxAmount: string;
  minTerm: number;
  maxTerm: number;
  interestRate: string;
  effortRate: string;
  processingFee: string;
  financialInstitutionId: string;
}

export default function SimulatorForm() {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedProgramData, setSelectedProgramData] = useState<CreditProgram | undefined>();

  const form = useForm<SimulatorForm>({
    resolver: zodResolver(simulatorSchema),
    defaultValues: {
      amount: "AOA 5,000,000",
      term: "36",
      projectType: "corn",
    },
  });

  const simulate = useMutation({
    mutationFn: async (data: SimulatorForm) => {
      const simulationData = {
        amount: parseKwanza(data.amount),
        term: parseInt(data.term),
        projectType: data.projectType,
        creditProgramId: selectedProgram || undefined,
      };
      
      const response = await apiRequest("POST", "/api/simulate-credit", simulationData);
      return response.json() as Promise<SimulationResult>;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const onSubmit = (data: SimulatorForm) => {
    simulate.mutate(data);
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

  const handleInstitutionChange = (institutionId: string) => {
    setSelectedInstitution(institutionId);
    setSelectedProgram("");
    setSelectedProgramData(undefined);
    setResult(null);
  };

  const handleProgramChange = (programId: string, program?: CreditProgram) => {
    setSelectedProgram(programId);
    setSelectedProgramData(program);
    setResult(null);
    
    // Update form values based on selected program
    if (program) {
      const amount = parseKwanza(form.getValues('amount'));
      const minAmount = parseInt(program.minAmount);
      const maxAmount = parseInt(program.maxAmount);
      
      // Ensure amount is within program limits
      if (amount < minAmount) {
        form.setValue('amount', formatKwanza(minAmount));
      } else if (amount > maxAmount) {
        form.setValue('amount', formatKwanza(maxAmount));
      }
      
      // Ensure term is within program limits
      const term = parseInt(form.getValues('term'));
      if (term < program.minTerm) {
        form.setValue('term', program.minTerm.toString());
      } else if (term > program.maxTerm) {
        form.setValue('term', program.maxTerm.toString());
      }
    }
  };

  return (
    <div className="space-y-6">
      <FinancialInstitutionSelector
        selectedInstitution={selectedInstitution}
        onInstitutionChange={handleInstitutionChange}
        selectedProgram={selectedProgram}
        onProgramChange={handleProgramChange}
        projectType={form.watch('projectType')}
      />
      
      <Card className="shadow-xl">
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            
            <FormField
              control={form.control}
              name="projectType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Tipo de Projecto Agrícola</FormLabel>
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
            
            <Button 
              type="submit" 
              disabled={simulate.isPending}
              className="w-full bg-agri-primary text-white hover:bg-agri-dark py-4 rounded-xl font-semibold text-xl transition-colors"
            >
              <Calculator className="w-5 h-5 mr-2" />
              {simulate.isPending ? "Calculando..." : "Calcular Simulação"}
            </Button>
          </form>
        </Form>
        
        {result && (
          <div className="mt-8 p-6 bg-agri-light rounded-xl border-l-4 border-agri-primary">
            <h3 className="text-xl font-bold text-agri-dark mb-4">Resultado da Simulação</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-agri-primary">
                  {formatKwanza(result.monthlyPayment)}
                </div>
                <div className="text-sm text-gray-600">Prestação Mensal</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-agri-secondary">
                  {formatKwanza(result.totalAmount)}
                </div>
                <div className="text-sm text-gray-600">Total a Pagar</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">
                  {result.interestRate}% a.a.
                </div>
                <div className="text-sm text-gray-600">Taxa de Juro</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-lg text-gray-700">
                <strong>Juros totais:</strong> {formatKwanza(result.totalInterest)}
              </div>
            </div>
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
}
