import { db } from "../config/firebase";
import { FieldValue } from "firebase-admin/firestore";
import type { CartOrderItem, OrderRecord } from "../types";

export class OrderRepository {
  private clients = db.collection("clients");

  async processOrderTransaction(
    clientId: string,
    storeId: string,
    items: CartOrderItem[],
    totalAmount: number,
    cashierName: string
  ): Promise<{ orderId: string; createdAt: string }> {
    const clientRef = this.clients.doc(clientId);
    const storeRef = clientRef.collection("stores").doc(storeId);
    const ordersCol = storeRef.collection("orders");
    const newOrderRef = ordersCol.doc();

    const now = new Date();
    const createdAt = now.toISOString();
    const dateKey = now.toISOString().split("T")[0]; // YYYY-MM-DD

    await db.runTransaction(async (transaction) => {
      const [clientDoc, storeDoc] = await Promise.all([
        transaction.get(clientRef),
        transaction.get(storeRef),
      ]);

      if (!storeDoc.exists) {
        throw new Error(`Store '${storeId}' does not exist.`);
      }

      // Fetch catalog items to resolve recipe deductions
      const catalogIds = Array.from(new Set(items.map((i) => i.catalogId)));
      const catalogDocs = await Promise.all(
        catalogIds.map((cId) => transaction.get(storeRef.collection("catalog").doc(cId)))
      );

      // Map ingredient deductions: ingredientId -> amount to deduct
      const deductions: Record<string, number> = {};

      for (const cartItem of items) {
        const catDoc = catalogDocs.find((d) => d.id === cartItem.catalogId);
        if (catDoc && catDoc.exists) {
          const recipe: any[] = catDoc.data()?.recipe || [];
          const multiplier = cartItem.size === "upsized" ? 1.35 : 1.0;

          for (const ing of recipe) {
            const deductQty = (Number(ing.amount) || 0) * cartItem.quantity * multiplier;
            deductions[ing.ingredientId] = (deductions[ing.ingredientId] || 0) + deductQty;
          }
        }
      }

      // Decrement inventory stock atomically
      for (const [ingId, qty] of Object.entries(deductions)) {
        const ingRef = storeRef.collection("ingredients").doc(ingId);
        transaction.update(ingRef, {
          currentStock: FieldValue.increment(-qty),
          updatedAt: createdAt,
        });
      }

      // Check date rollover for store daily totals
      const storeData = storeDoc.data() || {};
      const storeLastDate = storeData.lastOrderDate || "";
      const isNewStoreDay = storeLastDate !== dateKey;

      transaction.update(storeRef, {
        todaySales: isNewStoreDay ? totalAmount : FieldValue.increment(totalAmount),
        todayOrders: isNewStoreDay ? 1 : FieldValue.increment(1),
        totalSales: FieldValue.increment(totalAmount),
        totalOrders: FieldValue.increment(1),
        lastOrderDate: dateKey,
        updatedAt: createdAt,
      });

      // Update client aggregate metrics
      if (clientDoc.exists) {
        const clientData = clientDoc.data() || {};
        const clientLastDate = clientData.lastOrderDate || "";
        const isNewClientDay = clientLastDate !== dateKey;

        transaction.update(clientRef, {
          todaySales: isNewClientDay ? totalAmount : FieldValue.increment(totalAmount),
          todayOrders: isNewClientDay ? 1 : FieldValue.increment(1),
          totalSales: FieldValue.increment(totalAmount),
          totalOrders: FieldValue.increment(1),
          lastOrderDate: dateKey,
          updatedAt: createdAt,
        });
      }

      // Record immutable order receipt
      const orderRecord: OrderRecord = {
        items,
        totalAmount,
        cashierName,
        dateKey,
        createdAt,
      };

      transaction.set(newOrderRef, orderRecord);
    });

    return { orderId: newOrderRef.id, createdAt };
  }
}