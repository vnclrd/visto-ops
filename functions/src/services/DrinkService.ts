import { DrinkRepository } from '../repositories/DrinkRepository';
import type { MenuItemRecord } from '../types';
import type {
  DrinkManagePayload,
  DrinkManageOperation,
} from '../functions/visto-cafe-drinkManage/request';

export class DrinkService {
  constructor(private repo = new DrinkRepository()) {}

  async manageDrink(
    clientId: string,
    storeId: string,
    operation: DrinkManageOperation,
    drinkId?: string,
    data?: DrinkManagePayload,
  ) {
    if (operation === 'create') {
      if (!data?.name || data?.price === undefined) {
        throw new Error('Name and price are required to create a drink');
      }

      const newRecord: Omit<MenuItemRecord, 'id'> = {
        name: data.name.trim(),
        category: data.category?.trim() || 'General',
        price: Number(data.price),
        cost: Number(data.cost) || 0,
        emoji: data.emoji || '☕',
        recipe: data.recipe || [],
        isActive: data.isActive !== false,
      };

      return await this.repo.createDrink(clientId, storeId, newRecord, data.id);
    }

    if (operation === 'update') {
      const targetId = drinkId || data?.id;
      if (!targetId) {
        throw new Error('Drink ID is required for update');
      }

      const updates: any = {};

      if (data?.name !== undefined) updates.name = data.name.trim();
      if (data?.category !== undefined) updates.category = data.category.trim();
      if (data?.price !== undefined) updates.price = Number(data.price);
      if (data?.cost !== undefined) updates.cost = Number(data.cost);
      if (data?.emoji !== undefined) updates.emoji = data.emoji;
      if (data?.recipe !== undefined) updates.recipe = data.recipe;
      if (data?.isActive !== undefined)
        updates.isActive = Boolean(data.isActive);

      const updated = await this.repo.updateDrink(
        clientId,
        storeId,
        targetId,
        updates,
      );
      if (!updated) {
        throw new Error(`Drink '${targetId}' not found`);
      }

      return { id: targetId, updated: true };
    }

    if (operation === 'delete') {
      const targetId = drinkId || data?.id;
      if (!targetId) {
        throw new Error('Drink ID is required for delete');
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
