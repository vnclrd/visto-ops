import { db } from '../config/firebase';
import type { MetricsGetResponse, StoreMetrics } from '../types';

export class MetricRepository {
  private clients = db.collection('clients');

  private getTodayKey(): string {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  }

  async getStoreMetrics(
    clientId: string,
    storeId: string,
  ): Promise<MetricsGetResponse> {
    const storeRef = this.clients
      .doc(clientId)
      .collection('stores')
      .doc(storeId);
    const doc = await storeRef.get();

    if (!doc.exists) {
      throw new Error(`Store '${storeId}' not found.`);
    }

    const data = doc.data() || {};
    const todayKey = this.getTodayKey();
    const isToday = data.lastOrderDate === todayKey;

    return {
      todaySales: isToday ? Number(data.todaySales) || 0 : 0,
      todayOrders: isToday ? Number(data.todayOrders) || 0 : 0,
      totalSales: Number(data.totalSales) || 0,
      totalOrders: Number(data.totalOrders) || 0,
    };
  }

  async getGlobalMetrics(clientId: string): Promise<MetricsGetResponse> {
    const clientRef = this.clients.doc(clientId);
    const [clientDoc, storesSnapshot] = await Promise.all([
      clientRef.get(),
      clientRef.collection('stores').get(),
    ]);

    if (!clientDoc.exists) {
      throw new Error(`Client '${clientId}' not found.`);
    }

    const todayKey = this.getTodayKey();

    const stores: StoreMetrics[] = storesSnapshot.docs.map((doc) => {
      const data = doc.data() || {};
      const isStoreToday = data.lastOrderDate === todayKey;

      return {
        storeId: doc.id,
        storeName: data.name ?? doc.id,
        todaySales: isStoreToday ? Number(data.todaySales) || 0 : 0,
        todayOrders: isStoreToday ? Number(data.todayOrders) || 0 : 0,
        totalSales: Number(data.totalSales) || 0,
        totalOrders: Number(data.totalOrders) || 0,
        isActive: data.isActive !== false,
      };
    });

    const activeBranchesCount = stores.filter((s) => s.isActive).length;

    // Aggregate from individual stores for real-time accuracy
    const todaySales = stores.reduce((sum, s) => sum + s.todaySales, 0);
    const todayOrders = stores.reduce((sum, s) => sum + s.todayOrders, 0);
    const totalSales = stores.reduce((sum, s) => sum + s.totalSales, 0);
    const totalOrders = stores.reduce((sum, s) => sum + s.totalOrders, 0);

    return {
      todaySales,
      todayOrders,
      totalSales,
      totalOrders,
      activeBranchesCount,
      totalBranchesCount: stores.length,
      stores,
    };
  }
}
