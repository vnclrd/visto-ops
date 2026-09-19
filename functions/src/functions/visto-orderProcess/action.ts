import type { OrderProcessRequest } from "./request";
import { OrderService } from "../../services/OrderService";
import { OrderMiddleware } from "../../middlewares/OrderMiddleware";

const orderService = new OrderService();

export async function orderProcessAction(payload: OrderProcessRequest) {
  OrderMiddleware.validate(payload);

  return await orderService.processOrder(
    payload.clientId,
    payload.storeId,
    payload.items,
    payload.totalAmount,
    payload.cashierName
  );
}