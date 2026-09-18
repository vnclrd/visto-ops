import { IngredientRepository } from "../repositories/IngredientRepository";
import type { IngredientRecord } from "../types";

export class IngredientService {
  constructor(private repo = new IngredientRepository()) {}

  async getIngredients(clientId: string, storeId: string): Promise<IngredientRecord[]> {
    return await this.repo.getAllByStore(clientId, storeId);
  }
}