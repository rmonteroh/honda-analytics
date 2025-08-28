import { AnalyticsData } from '../types/analytics';

const API_BASE_URL = 'http://localhost:3000';

export class AnalyticsService {
  static async fetchAnalyticsData(): Promise<AnalyticsData> {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: AnalyticsData = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  }
}