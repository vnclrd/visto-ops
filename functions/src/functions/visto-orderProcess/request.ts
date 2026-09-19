import type { CartOrderItem } from "../../types";

export interface OrderProcessRequest {
  clientId: string;
  storeId: string;
  items: CartOrderItem[];
  totalAmount: number;
  cashierName: string;
}