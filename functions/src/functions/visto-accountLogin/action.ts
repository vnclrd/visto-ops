import { AccountLoginRequest } from "./request";
import { AccountService } from "../../services/AccountService";

const accountService = new AccountService();

export async function accountLoginAction(payload: AccountLoginRequest) {
  if (!payload.email || !payload.password) {
    throw new Error("Email and password are required");
  }

  return await accountService.authenticateClient(payload.email, payload.password);
}