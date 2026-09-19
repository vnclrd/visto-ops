import { DrinkRepository } from "../repositories/DrinkRepository";
import type { MenuItemRecord } from "../types";
import type {
  DrinkManageDataPayload,
  DrinkManageOperation,
} from "../functions/visto-fnb-drinkManage/request";

export class DrinkService {
  constructor(private repo = new DrinkRepository()) {}

  async manageDrink(
    clientId: string,
    storeId: string,
    operation: DrinkManageOperation,
    drinkId?: string,
    data?: DrinkManageDataPayload
  ) {
    if (operation === "create") {
      if (!data?.name || !data.name.trim()) {
        throw new Error("Drink name is required");
      }
      if (data.price === undefined || Number(data.price) < 0) {
        throw new Error("A valid non-negative selling price is required");
      }
      if (!data.recipe || !Array.isArray(data.recipe) || data.recipe.length === 0) {
        throw new Error("A recipe must include at least one ingredient");
      }

      const calculatedCost = data.recipe.reduce(
        (acc, curr) => acc + (Number(curr.totalCost) || 0),
        0
      );

      const newRecord: Omit<MenuItemRecord, "id"> = {
        name: data.name.trim(),
        category: data.category?.trim() || "Espresso",
        price: Number(data.price),
        cost: calculatedCost,
        recipe: data.recipe,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      };

      return await this.repo.createDrink(clientId, storeId, newRecord, data.id);
    }

    if (operation === "update") {
      const targetId = drinkId || data?.id;
      if (!targetId) {
        throw new Error("Drink ID is required for update");
      }

      const updates: any = {};
      if (data?.name !== undefined) updates.name = data.name.trim();
      if (data?.category !== undefined) updates.category = data.category.trim();
      if (data?.price !== undefined) updates.price = Number(data.price);
      if (data?.isActive !== undefined) updates.isActive = Boolean(data.isActive);

      if (data?.recipe !== undefined) {
        if (!Array.isArray(data.recipe) || data.recipe.length === 0) {
          throw new Error("A recipe cannot be empty");
        }
        updates.recipe = data.recipe;
        updates.cost = data.recipe.reduce(
          (acc, curr) => acc + (Number(curr.totalCost) || 0),
          0
        );
      }

      const updated = await this.repo.updateDrink(clientId, storeId, targetId, updates);
      if (!updated) {
        throw new Error(`Drink '${targetId}' not found`);
      }

      return { id: targetId, updated: true };
    }

    if (operation === "delete") {
      const targetId = drinkId || data?.id;
      if (!targetId) {
        throw new Error("Drink ID is required for delete");
      }

      const deleted = await this.repo.deleteDrink(clientId, storeId, targetId);
      if (!deleted) {
        throw new Error(`Drink '${targetId}' not found`);
      }

      return { id: targetId, deleted: true };
    }

    throw new Error(`Unsupported operation: ${operation}`);
  }
}