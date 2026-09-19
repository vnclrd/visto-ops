import { db } from "../config/firebase";
import type { MenuItemRecord } from "../types";

export class DrinkRepository {
  private collection = db.collection("clients");

  private getCatalogCollection(clientId: string, storeId: string) {
    return this.collection
      .doc(clientId)
      .collection("stores")
      .doc(storeId)
      .collection("catalog");
  }

  async getDrinkById(
    clientId: string,
    storeId: string,
    drinkId: string
  ): Promise<MenuItemRecord | null> {
    const doc = await this.getCatalogCollection(clientId, storeId).doc(drinkId).get();
    if (!doc.exists) {
      return null;
    }
    const data = doc.data()!;
    return {
      id: doc.id,
      name: data.name ?? "",
      category: data.category ?? "General",
      price: Number(data.price) || 0,
      cost: Number(data.cost) || 0,
      recipe: data.recipe || [],
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  async createDrink(
    clientId: string,
    storeId: string,
    drinkData: Omit<MenuItemRecord, "id">,
    customId?: string
  ): Promise<MenuItemRecord> {
    const colRef = this.getCatalogCollection(clientId, storeId);
    const docRef = customId ? colRef.doc(customId) : colRef.doc();

    const now = new Date().toISOString();
    const recordToSave = {
      ...drinkData,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(recordToSave);

    return {
      id: docRef.id,
      ...recordToSave,
    };
  }

  async updateDrink(
    clientId: string,
    storeId: string,
    drinkId: string,
    updates: Partial<Omit<MenuItemRecord, "id" | "createdAt">>
  ): Promise<boolean> {
    const docRef = this.getCatalogCollection(clientId, storeId).doc(drinkId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return false;
    }

    await docRef.update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return true;
  }

  async deleteDrink(
    clientId: string,
    storeId: string,
    drinkId: string
  ): Promise<boolean> {
    const docRef = this.getCatalogCollection(clientId, storeId).doc(drinkId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return false;
    }

    await docRef.delete();
    return true;
  }
}