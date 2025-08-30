export interface StatData {
  total: number;
  percentage: string;
}

export interface AnalyticsData {
  general: {
    accepted: StatData;
    declined: StatData;
    followUp: StatData;
    undelivered: StatData;
  };
  conversion: {
    sentToDealerWhatsapp: StatData;
    acceptedOutBusinessHours: StatData;
  };
  followUp: {
    acceptedFirstContact: StatData;
    acceptedSecondContact: StatData;
  };
  totalTrackedUsers: number;
  totalHondaConversations: number;
}