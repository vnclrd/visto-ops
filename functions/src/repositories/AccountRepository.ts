import { db } from "../config/firebase";

export interface ClientAccount {
  id: string;
  name: string;
  email: string;
  password: string;
}

export class AccountRepository {
  private collection = db.collection("clients");

  async findByEmail(email: string): Promise<ClientAccount | null> {
    const snapshot = await this.collection
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      name: data.name ?? "",
      email: data.email ?? "",
      password: data.password ?? "",
    };
  }
}