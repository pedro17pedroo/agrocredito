import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import SimulatorForm from "@/components/credit/simulator-form";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function Simulator() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const handleBack = () => {
    if (user) {
      setLocation("/dashboard");
    } else {
      setLocation("/");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!user && <Navbar />}
      
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8">
            <Button
              variant="outline"
              onClick={handleBack}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-agri-dark">Simulador de Crédito Agrícola</h1>
              <p className="text-gray-600">Calcule as condições do seu financiamento em Kwanzas (AOA)</p>
            </div>
          </div>

          <SimulatorForm />
        </div>
      </div>

      {!user && <Footer />}
    </div>
  );
}
