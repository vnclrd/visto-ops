import type { AccountVerifyPinRequest } from "./request";
import { AccountService } from "../../services/AccountService";

const accountService = new AccountService();

export async function accountVerifyPinAction(payload: AccountVerifyPinRequest) {
  if (!payload.clientId) {
    throw new Error("Client ID is required");
  }

  // Accept either storePin or pin
  const pinToVerify = payload.storePin || payload.pin;

  if (!pinToVerify) {
    throw new Error(payload.storeId ? "Store PIN is required" : "PIN is required");
  }

  return await accountService.verifyPin(payload.clientId, pinToVerify, payload.storeId);
}