import { OrderRepository } from "../repositories/OrderRepository";
import type { CartOrderItem } from "../types";

export class OrderService {
  constructor(private repo = new OrderRepository()) {}

  async processOrder(
    clientId: string,
    storeId: string,
    items: CartOrderItem[],
    totalAmount: number,
    cashierName: string
  ) {
    if (!items || items.length === 0) {
      throw new Error("Order must contain at least one item.");
    }
    if (typeof totalAmount !== "number" || totalAmount <= 0) {
      throw new Error("Total amount must be a positive number.");
    }

    return await this.repo.processOrderTransaction(
      clientId,
      storeId,
      items,
      totalAmount,
      cashierName
    );
  }
}