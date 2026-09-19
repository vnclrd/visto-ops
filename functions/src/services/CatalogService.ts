import { CatalogRepository } from "../repositories/CatalogRepository";
import type { MenuItemRecord } from "../types";

export class CatalogService {
  constructor(private repo = new CatalogRepository()) {}

  async getCatalog(clientId: string, storeId: string): Promise<MenuItemRecord[]> {
    return await this.repo.getAllByStore(clientId, storeId);
  }
}