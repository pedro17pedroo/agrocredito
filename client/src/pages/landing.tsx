import { useState } from "react";
import { Link } from "wouter";
import { Sprout, Calculator, Shield, Clock, Smartphone } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import SimulatorForm from "@/components/credit/simulator-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function Landing() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

  const scrollToSimulator = () => {
    document.getElementById('simulator-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        onLoginClick={() => setShowLogin(true)}
        onRegisterClick={() => setShowRegister(true)}
      />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-agri-light to-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-gradient-to-r from-green-200 to-green-100"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold text-agri-dark mb-6 leading-tight">
                Democratizar o Acesso ao 
                <span className="text-agri-primary"> Crédito Agrícola</span>
              </h1>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Conectamos agricultores e empresas agrícolas a instituições financeiras em Angola. 
                Processo rápido, seguro e personalizado para o seu projeto agrícola.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  onClick={() => setShowRegister(true)}
                  className="btn-large btn-primary"
                >
                  <Sprout className="w-5 h-5 mr-2" />
                  Solicitar Crédito Agora
                </Button>
                <Button 
                  variant="outline"
                  onClick={scrollToSimulator}
                  className="btn-large btn-secondary"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  Simular Financiamento
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
                <Sprout className="w-16 h-16 text-agri-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-agri-dark mb-4">Plataforma 100% Digital</h3>
                <p className="text-gray-600 mb-6">Interface simples e segura para agricultores angolanos</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-agri-light p-3 rounded-lg">
                    <div className="text-2xl font-bold text-agri-primary">1000+</div>
                    <div className="text-gray-600">Agricultores</div>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">95%</div>
                    <div className="text-gray-600">Taxa Aprovação</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-agri-dark mb-4">
              Como o AgroCrédito Transforma o Seu Negócio
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Uma plataforma digital 100% online que conecta agricultores a instituições financeiras de forma simples e segura.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl hover:shadow-lg transition-shadow border border-gray-100">
              <div className="bg-agri-light rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Smartphone className="text-agri-primary w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold text-agri-dark mb-4">Acesso Fácil</h3>
              <p className="text-gray-600 text-lg">
                Interface simples pensada para utilizadores com baixa literacia digital. 
                Botões grandes e poucos cliques.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl hover:shadow-lg transition-shadow border border-gray-100">
              <div className="bg-agri-light rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Clock className="text-agri-primary w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold text-agri-dark mb-4">Processo Rápido</h3>
              <p className="text-gray-600 text-lg">
                Solicitação e aprovação de crédito em minutos. 
                Análise automatizada e resposta imediata.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl hover:shadow-lg transition-shadow border border-gray-100">
              <div className="bg-agri-light rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Shield className="text-agri-primary w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold text-agri-dark mb-4">100% Seguro</h3>
              <p className="text-gray-600 text-lg">
                Dados protegidos com criptografia avançada. 
                Autenticação robusta e transações seguras.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Credit Simulator Section */}
      <section id="simulator-section" className="py-20 bg-gradient-to-br from-agri-light to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-agri-dark mb-4">
              Simulador de Crédito Agrícola
            </h2>
            <p className="text-xl text-gray-600">
              Calcule as condições do seu financiamento em Kwanzas (AOA)
            </p>
          </div>
          
          <SimulatorForm />
        </div>
      </section>

      <Footer />

      {/* Modals */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="sm:max-w-md">
          <LoginForm 
            onSuccess={() => setShowLogin(false)}
            onSwitchToRegister={() => {
              setShowLogin(false);
              setShowRegister(true);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <RegisterForm 
            onSuccess={() => setShowRegister(false)}
            onSwitchToLogin={() => {
              setShowRegister(false);
              setShowLogin(true);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
