import type { AccountVerifyPinRequest } from "./request";
import { AccountService } from "../../services/AccountService";

const accountService = new AccountService();

export async function accountVerifyPinAction(payload: AccountVerifyPinRequest) {
  if (!payload.clientId || !payload.pin) {
    throw new Error("Client ID and PIN are required");
  }

  return await accountService.verifyOwnerPin(payload.clientId, payload.pin);
}