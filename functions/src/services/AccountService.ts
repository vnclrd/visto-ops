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

    // Exclude both password and pin from the returned safeData
    const { password, pin, ...safeData } = client;
    return safeData;
  }

  async verifyOwnerPin(clientId: string, inputPin: string): Promise<boolean> {
    const storedPin = await this.repo.getPinById(clientId);

    if (!storedPin) {
      throw new Error("Client account not found or PIN not configured");
    }

    if (storedPin !== inputPin) {
      throw new Error("Invalid owner PIN");
    }

    return true;
  }
}