import { db } from "../config/firebase";
import type { ClientAccount, StoreItem } from "../types";

export class AccountRepository {
  private collection = db.collection("clients");

  async findByEmail(email: string): Promise<ClientAccount | null> {
    const snapshot = await this.collection
      .where("email", "==", email.trim())
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    // Query subcollection 'stores'
    const storesSnapshot = await doc.ref.collection("stores").get();
    const stores: StoreItem[] = storesSnapshot.docs.map((storeDoc) => {
      const storeData = storeDoc.data();
      return {
        id: storeDoc.id,
        name: storeData.name ?? storeDoc.id,
        location: storeData.location ?? "",
        isActive: storeData.isActive ?? true,
      };
    });

    return {
      id: doc.id, // Will be "VistoOps"
      name: data.name ?? "",
      email: data.email ?? "",
      password: data.password ?? "",
      owner: data.owner ?? "",
      stores,
    };
  }

  // Reads: /clients/{clientId} -> field 'pin'
  async getOwnerPinById(clientId: string): Promise<string | null> {
    const doc = await this.collection.doc(clientId).get();
    if (!doc.exists) {
      return null;
    }
    const data = doc.data();
    return data?.pin !== undefined ? String(data.pin).trim() : null;
  }

  // Reads: /clients/{clientId}/stores/{storeId} -> field 'storePin'
  async getStorePinById(clientId: string, storeId: string): Promise<string | null> {
    const storeDoc = await this.collection
      .doc(clientId)
      .collection("stores")
      .doc(storeId)
      .get();

    if (!storeDoc.exists) {
      return null;
    }
    const data = storeDoc.data();
    return data?.storePin !== undefined ? String(data.storePin).trim() : null;
  }
}