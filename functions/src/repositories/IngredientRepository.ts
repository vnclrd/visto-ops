import { db } from "../config/firebase";
import type { IngredientRecord } from "../types";

export class IngredientRepository {
  private collection = db.collection("clients");

  async getAllByStore(clientId: string, storeId: string): Promise<IngredientRecord[]> {
    const snapshot = await this.collection
      .doc(clientId)
      .collection("stores")
      .doc(storeId)
      .collection("ingredients")
      .get();

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
}