import { AccountRepository } from "../repositories/AccountRepository";
import type { ClientAccount } from "../types";

export class AccountService {
  constructor(private repo = new AccountRepository()) {}

  async authenticateClient(
    email: string,
    pass: string
  ): Promise<Omit<ClientAccount, "password" | "pin">> {
    const client = await this.repo.findByEmail(email);

    if (!client || client.password !== pass) {
      throw new Error("Invalid client credentials");
    }

    const { password, pin, ...safeData } = client;
    return safeData;
  }

  async verifyPin(clientId: string, inputPin: string, storeId?: string): Promise<boolean> {
    const sanitizedInput = String(inputPin).trim();

    if (storeId) {
      // Validating Store Access -> must match storePin
      const expectedStorePin = await this.repo.getStorePinById(clientId, storeId);
      
      if (!expectedStorePin) {
        throw new Error(`Store '${storeId}' not found or storePin not configured`);
      }

      if (expectedStorePin !== sanitizedInput) {
        throw new Error("Invalid Store PIN");
      }

      return true;
    }

    // Validating Dashboard -> must match owner pin
    const expectedOwnerPin = await this.repo.getOwnerPinById(clientId);

    if (!expectedOwnerPin) {
      throw new Error("Owner PIN not configured for this account");
    }

    if (expectedOwnerPin !== sanitizedInput) {
      throw new Error("Invalid Owner PIN");
    }

    return true;
  }
}