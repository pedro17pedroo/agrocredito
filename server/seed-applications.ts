import { db } from "./db";
import { eq } from "drizzle-orm";
import { users, creditApplications, type InsertCreditApplication } from "@shared/schema";

export async function seedApplications() {
  try {
    console.log("🌾 Criando solicitações de crédito de exemplo...");

    // Buscar o utilizador agricultor
    const [farmer] = await db
      .select()
      .from(users)
      .where(eq(users.phone, "+244923456789"))
      .limit(1);

    if (!farmer) {
      console.log("❌ Utilizador agricultor não encontrado. Execute primeiro o seed principal.");
      return;
    }

    // Lista de solicitações de exemplo
    const sampleApplications: InsertCreditApplication[] = [
      {
        userId: farmer.id,
        projectName: "Cultivo de Milho - Época das Chuvas",
        projectType: "corn",
        description: "Projeto para cultivo de 5 hectares de milho durante a época das chuvas. Incluí preparação do terreno, sementes melhoradas, fertilizantes e pesticidas. Expectativa de produção de 25 toneladas.",
        amount: "750000.00", // 750.000 AOA
        term: 12,
        status: "pending"
      },
      {
        userId: farmer.id,
        projectName: "Criação de Gado Bovino",
        projectType: "cattle",
        description: "Aquisição de 10 cabeças de gado bovino para criação e reprodução. Inclui construção de curral, vacinação e alimentação para os primeiros 6 meses.",
        amount: "2500000.00", // 2.500.000 AOA
        term: 24,
        status: "under_review"
      },
      {
        userId: farmer.id,
        projectName: "Plantação de Mandioca",
        projectType: "cassava",
        description: "Cultivo de 3 hectares de mandioca. Projeto inclui preparação do solo, mudas, ferramentas agrícolas e mão-de-obra para plantio e colheita.",
        amount: "450000.00", // 450.000 AOA
        term: 18,
        status: "approved"
      },
      {
        userId: farmer.id,
        projectName: "Avicultura - Galinhas Poedeiras",
        projectType: "poultry",
        description: "Montagem de aviário para 200 galinhas poedeiras. Inclui construção do galinheiro, aquisição das aves, ração para os primeiros 3 meses e equipamentos.",
        amount: "850000.00", // 850.000 AOA
        term: 15,
        status: "rejected"
      },
      {
        userId: farmer.id,
        projectName: "Horta Comunitária - Produtos Hortícolas",
        projectType: "horticulture",
        description: "Desenvolvimento de horta para produção de tomate, cebola, alface e pimento. Inclui sistema de irrigação, sementes, fertilizantes orgânicos e ferramentas.",
        amount: "320000.00", // 320.000 AOA
        term: 9,
        status: "pending"
      }
    ];

    // Criar as solicitações
    for (const application of sampleApplications) {
      const [existing] = await db
        .select()
        .from(creditApplications)
        .where(eq(creditApplications.projectName, application.projectName))
        .limit(1);

      if (!existing) {
        await db.insert(creditApplications).values(application);
        console.log(`  ✅ Solicitação criada: ${application.projectName} (${application.status})`);
      } else {
        console.log(`  ⏭️ Solicitação já existe: ${application.projectName}`);
      }
    }

    console.log("🎉 Solicitações de crédito de exemplo criadas com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao criar solicitações de exemplo:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedApplications()
    .then(() => {
      console.log("Seed de solicitações executado com sucesso!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Erro no seed de solicitações:", error);
      process.exit(1);
    });
}