import { db } from "../config/firebase";
import type { MenuItemRecord } from "../types";

export class CatalogRepository {
  private collection = db.collection("clients");

  private getCatalogCollection(clientId: string, storeId: string) {
    return this.collection
      .doc(clientId)
      .collection("stores")
      .doc(storeId)
      .collection("catalog");
  }

  async getAllByStore(clientId: string, storeId: string): Promise<MenuItemRecord[]> {
    const snapshot = await this.getCatalogCollection(clientId, storeId).get();

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

      return {
        id: doc.id,
        name: data.name ?? "",
        category: data.category ?? "General",
        price: Number(data.price) || 0,
        emoji: data.emoji || '☕',
        cost: Number(data.cost) || 0,
        recipe: Array.isArray(data.recipe) ? data.recipe : [],
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        createdAt: parseDate(data.createdAt),
        updatedAt: parseDate(data.updatedAt),
      };
    });
  }
}