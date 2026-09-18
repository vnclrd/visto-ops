import { db } from "../config/firebase";
import type { IngredientRecord } from "../types";

export class IngredientRepository {
  private collection = db.collection("clients");

  private getIngredientsCollection(clientId: string, storeId: string) {
    return this.collection
      .doc(clientId)
      .collection("stores")
      .doc(storeId)
      .collection("ingredients");
  }

  // visto-ingredientGet
  async getAllByStore(clientId: string, storeId: string): Promise<IngredientRecord[]> {
    const snapshot = await this.getIngredientsCollection(clientId, storeId).get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) => {
      const data = doc.data();

      const parseDate = (val: any): string | undefined => {
        if (!val) return undefined;
        if (typeof val.toDate === "function") return val.toDate().toISOString();
        return new Date(val).toISOString();
      };

      const packageSpecs = data.packageSpecs || {};

      return {
        id: doc.id,
        name: data.name ?? "",
        category: data.category ?? "General",
        costPerUnit: Number(data.costPerUnit) || 0,
        currentStock: Number(data.currentStock) || 0,
        unit: data.unit ?? "",
        reorderLevel: Number(data.reorderLevel) || 0,
        packageSpecs: {
          packagePrice: Number(packageSpecs.packagePrice) || 0,
          packageSize: Number(packageSpecs.packageSize) || 0,
        },
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        createdAt: parseDate(data.createdAt),
        updatedAt: parseDate(data.updatedAt),
      };
    });
  }

  // visto-ingredientManage
  async createIngredient(
    clientId: string,
    storeId: string,
    ingredientData: Omit<IngredientRecord, "id">,
    customId?: string
  ): Promise<IngredientRecord> {
    const colRef = this.getIngredientsCollection(clientId, storeId);
    const docRef = customId ? colRef.doc(customId) : colRef.doc();

    const now = new Date().toISOString();

    const recordToSave = {
      ...ingredientData,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(recordToSave);

    return {
      id: docRef.id,
      ...recordToSave,
    };
  }

  // visto-ingredientManage
  async updateIngredient(
    clientId: string,
    storeId: string,
    ingredientId: string,
    updates: Partial<Omit<IngredientRecord, "id" | "createdAt">>
  ): Promise<boolean> {
    const docRef = this.getIngredientsCollection(clientId, storeId).doc(ingredientId);
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

  // visto-ingredientManage
  async deleteIngredient(
    clientId: string,
    storeId: string,
    ingredientId: string
  ): Promise<boolean> {
    const docRef = this.getIngredientsCollection(clientId, storeId).doc(ingredientId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return false;
    }

    await docRef.delete();
    return true;
  }
}