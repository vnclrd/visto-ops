import { AccountRepository } from "../repositories/AccountRepository";
import type { ClientAccount } from "../types";

export class AccountService {
  constructor(private repo = new AccountRepository()) {}

  async authenticateClient(
    email: string,
    pass: string
  ): Promise<Omit<ClientAccount, "password">> {
    const client = await this.repo.findByEmail(email);

    if (!client || client.password !== pass) {
      throw new Error("Invalid client credentials");
    }

    const { password, ...safeData } = client;
    return safeData;
  }
}