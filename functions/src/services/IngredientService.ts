import { IngredientRepository } from '../repositories/IngredientRepository';
import type { IngredientRecord } from '../types';
import type {
  IngredientManagePayload,
  IngredientManageOperation,
} from '../functions/visto-cafe-ingredientsManage/request';

export class IngredientService {
  constructor(private repo = new IngredientRepository()) {}

  async getIngredients(
    clientId: string,
    storeId: string,
  ): Promise<IngredientRecord[]> {
    return await this.repo.getAllByStore(clientId, storeId);
  }

  // visto-ingredientManage
  async manageIngredient(
    clientId: string,
    storeId: string,
    operation: IngredientManageOperation,
    ingredientId?: string,
    data?: IngredientManagePayload,
  ) {
    if (operation === 'create') {
      if (!data?.name || !data?.unit) {
        throw new Error('Name and unit are required to create an ingredient');
      }

      const packagePrice = Number(data.packageSpecs?.packagePrice) || 0;
      const packageSize = Number(data.packageSpecs?.packageSize) || 0;
      const costPerUnit = packageSize > 0 ? packagePrice / packageSize : 0;

      const isRaw = data.itemType === 'raw';

      const newRecord: Omit<IngredientRecord, 'id'> = {
        name: data.name.trim(),
        category: data.category?.trim() || 'General',
        unit: data.unit.trim(),
        currentStock: isRaw ? 0 : Number(data.currentStock) || 0,
        reorderLevel: isRaw ? 0 : Number(data.reorderLevel) || 0,
        packageSpecs: {
          packagePrice,
          packageSize,
        },
        costPerUnit,
        itemType: data.itemType || 'direct', // <-- Add this
        batchRecipe: data.batchRecipe || [], // <-- Add this
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      };

      return await this.repo.createIngredient(
        clientId,
        storeId,
        newRecord,
        data.id,
      );
    }

    if (operation === 'update') {
      const targetId = ingredientId || data?.id;
      if (!targetId) {
        throw new Error('Ingredient ID is required for update');
      }

      const updates: any = {};

      if (data?.name !== undefined) updates.name = data.name.trim();
      if (data?.category !== undefined) updates.category = data.category.trim();
      if (data?.unit !== undefined) updates.unit = data.unit.trim();
      if (data?.itemType !== undefined) updates.itemType = data.itemType;
      if (data?.batchRecipe !== undefined)
        updates.batchRecipe = data.batchRecipe;
      if (data?.currentStock !== undefined && data.itemType !== 'raw') {
        updates.currentStock = Number(data.currentStock);
      }
      if (data?.reorderLevel !== undefined) {
        updates.reorderLevel = Number(data.reorderLevel);
      }
      if (data?.isActive !== undefined) {
        updates.isActive = Boolean(data.isActive);
      }

      if (data?.packageSpecs) {
        const packagePrice = Number(data.packageSpecs.packagePrice) || 0;
        const packageSize = Number(data.packageSpecs.packageSize) || 1;
        updates.packageSpecs = { packagePrice, packageSize };

        // If frontend passes a calculated blended costPerUnit, use it; otherwise fallback to simple price/size
        if (data?.costPerUnit !== undefined) {
          updates.costPerUnit = Number(data.costPerUnit);
        } else {
          updates.costPerUnit =
            packageSize > 0 ? packagePrice / packageSize : 0;
        }
      } else if (data?.costPerUnit !== undefined) {
        updates.costPerUnit = Number(data.costPerUnit);
      }

      const updated = await this.repo.updateIngredient(
        clientId,
        storeId,
        targetId,
        updates,
      );
      if (!updated) {
        throw new Error(`Ingredient '${targetId}' not found`);
      }

      return { id: targetId, updated: true };
    }

    if (operation === 'delete') {
      const targetId = ingredientId || data?.id;
      if (!targetId) {
        throw new Error('Ingredient ID is required for delete');
      }

      const deleted = await this.repo.deleteIngredient(
        clientId,
        storeId,
        targetId,
      );
      if (!deleted) {
        throw new Error(`Ingredient '${targetId}' not found`);
      }

      return { id: targetId, deleted: true };
    }

    throw new Error(`Unsupported operation: ${operation}`);
  }
}
