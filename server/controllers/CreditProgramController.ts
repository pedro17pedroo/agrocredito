import { Request, Response } from "express";
import { db } from "../db.js";
import { creditPrograms, insertCreditProgramSchema, InsertCreditProgram } from "../../shared/schema.js";
import { eq, and } from "drizzle-orm";

export class CreditProgramController {
  // Get all credit programs for a financial institution
  static async getPrograms(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: "Utilizador não autenticado" });
      }

      const programs = await db
        .select()
        .from(creditPrograms)
        .where(eq(creditPrograms.financialInstitutionId, userId))
        .orderBy(creditPrograms.createdAt);

      res.json(programs);
    } catch (error) {
      console.error("Error fetching credit programs:", error);
      res.status(500).json({ error: "Erro ao carregar programas de crédito" });
    }
  }

  // Get single credit program
  static async getProgram(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Utilizador não autenticado" });
      }

      const program = await db
        .select()
        .from(creditPrograms)
        .where(
          and(
            eq(creditPrograms.id, id),
            eq(creditPrograms.financialInstitutionId, userId)
          )
        )
        .limit(1);

      if (program.length === 0) {
        return res.status(404).json({ error: "Programa de crédito não encontrado" });
      }

      res.json(program[0]);
    } catch (error) {
      console.error("Error fetching credit program:", error);
      res.status(500).json({ error: "Erro ao carregar programa de crédito" });
    }
  }

  // Create new credit program
  static async createProgram(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: "Utilizador não autenticado" });
      }

      // Validate request body
      const validationResult = insertCreditProgramSchema.safeParse({
        ...req.body,
        financialInstitutionId: userId,
      });

      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: validationResult.error.errors 
        });
      }

      const programData: InsertCreditProgram = validationResult.data;

      const [newProgram] = await db
        .insert(creditPrograms)
        .values(programData)
        .returning();

      res.status(201).json(newProgram);
    } catch (error) {
      console.error("Error creating credit program:", error);
      res.status(500).json({ error: "Erro ao criar programa de crédito" });
    }
  }

  // Update credit program
  static async updateProgram(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Utilizador não autenticado" });
      }

      // Check if program exists and belongs to this institution
      const existingProgram = await db
        .select()
        .from(creditPrograms)
        .where(
          and(
            eq(creditPrograms.id, id),
            eq(creditPrograms.financialInstitutionId, userId)
          )
        )
        .limit(1);

      if (existingProgram.length === 0) {
        return res.status(404).json({ error: "Programa de crédito não encontrado" });
      }

      // Validate update data
      const updateData = insertCreditProgramSchema.partial().safeParse(req.body);

      if (!updateData.success) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: updateData.error.errors 
        });
      }

      const [updatedProgram] = await db
        .update(creditPrograms)
        .set({
          ...updateData.data,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(creditPrograms.id, id),
            eq(creditPrograms.financialInstitutionId, userId)
          )
        )
        .returning();

      res.json(updatedProgram);
    } catch (error) {
      console.error("Error updating credit program:", error);
      res.status(500).json({ error: "Erro ao atualizar programa de crédito" });
    }
  }

  // Delete credit program
  static async deleteProgram(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Utilizador não autenticado" });
      }

      // Check if program exists and belongs to this institution
      const existingProgram = await db
        .select()
        .from(creditPrograms)
        .where(
          and(
            eq(creditPrograms.id, id),
            eq(creditPrograms.financialInstitutionId, userId)
          )
        )
        .limit(1);

      if (existingProgram.length === 0) {
        return res.status(404).json({ error: "Programa de crédito não encontrado" });
      }

      await db
        .delete(creditPrograms)
        .where(
          and(
            eq(creditPrograms.id, id),
            eq(creditPrograms.financialInstitutionId, userId)
          )
        );

      res.json({ message: "Programa de crédito eliminado com sucesso" });
    } catch (error) {
      console.error("Error deleting credit program:", error);
      res.status(500).json({ error: "Erro ao eliminar programa de crédito" });
    }
  }

  // Toggle program active status
  static async toggleActiveStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Utilizador não autenticado" });
      }

      // Get current program
      const existingProgram = await db
        .select()
        .from(creditPrograms)
        .where(
          and(
            eq(creditPrograms.id, id),
            eq(creditPrograms.financialInstitutionId, userId)
          )
        )
        .limit(1);

      if (existingProgram.length === 0) {
        return res.status(404).json({ error: "Programa de crédito não encontrado" });
      }

      const [updatedProgram] = await db
        .update(creditPrograms)
        .set({
          isActive: !existingProgram[0].isActive,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(creditPrograms.id, id),
            eq(creditPrograms.financialInstitutionId, userId)
          )
        )
        .returning();

      res.json(updatedProgram);
    } catch (error) {
      console.error("Error toggling program status:", error);
      res.status(500).json({ error: "Erro ao alterar estado do programa" });
    }
  }
}