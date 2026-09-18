import { IngredientRepository } from "../repositories/IngredientRepository";
import type { IngredientRecord } from "../types";
import type { IngredientManagePayload, IngredientManageOperation } from "../functions/visto-ingredientsManage/request";

export class IngredientService {
  constructor(private repo = new IngredientRepository()) {}

  async getIngredients(clientId: string, storeId: string): Promise<IngredientRecord[]> {
    return await this.repo.getAllByStore(clientId, storeId);
  }

  // visto-ingredientManage
  async manageIngredient(
    clientId: string,
    storeId: string,
    operation: IngredientManageOperation,
    ingredientId?: string,
    data?: IngredientManagePayload
  ) {
    if (operation === "create") {
      if (!data?.name || !data?.unit) {
        throw new Error("Name and unit are required to create an ingredient");
      }

      const packagePrice = Number(data.packageSpecs?.packagePrice) || 0;
      const packageSize = Number(data.packageSpecs?.packageSize) || 0;
      const costPerUnit = packageSize > 0 ? packagePrice / packageSize : 0;

      const newRecord: Omit<IngredientRecord, "id"> = {
        name: data.name.trim(),
        category: data.category?.trim() || "General",
        unit: data.unit.trim(),
        currentStock: Number(data.currentStock) || 0,
        reorderLevel: Number(data.reorderLevel) || 0,
        packageSpecs: {
          packagePrice,
          packageSize,
        },
        costPerUnit,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      };

      return await this.repo.createIngredient(clientId, storeId, newRecord, data.id);
    }

    if (operation === "update") {
      const targetId = ingredientId || data?.id;
      if (!targetId) {
        throw new Error("Ingredient ID is required for update");
      }

      const updates: any = {};

      if (data?.name !== undefined) updates.name = data.name.trim();
      if (data?.category !== undefined) updates.category = data.category.trim();
      if (data?.unit !== undefined) updates.unit = data.unit.trim();
      if (data?.currentStock !== undefined) updates.currentStock = Number(data.currentStock);
      if (data?.reorderLevel !== undefined) updates.reorderLevel = Number(data.reorderLevel);
      if (data?.isActive !== undefined) updates.isActive = Boolean(data.isActive);

      if (data?.packageSpecs) {
        const packagePrice = Number(data.packageSpecs.packagePrice) || 0;
        const packageSize = Number(data.packageSpecs.packageSize) || 0;
        updates.packageSpecs = { packagePrice, packageSize };
        updates.costPerUnit = packageSize > 0 ? packagePrice / packageSize : 0;
      }

      const updated = await this.repo.updateIngredient(clientId, storeId, targetId, updates);
      if (!updated) {
        throw new Error(`Ingredient '${targetId}' not found`);
      }

      return { id: targetId, updated: true };
    }

    if (operation === "delete") {
      const targetId = ingredientId || data?.id;
      if (!targetId) {
        throw new Error("Ingredient ID is required for delete");
      }

      const deleted = await this.repo.deleteIngredient(clientId, storeId, targetId);
      if (!deleted) {
        throw new Error(`Ingredient '${targetId}' not found`);
      }

      return { id: targetId, deleted: true };
    }

    throw new Error(`Unsupported operation: ${operation}`);
  }
}