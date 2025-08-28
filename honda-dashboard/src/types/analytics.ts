export interface CustomCases {
  offeredWhatsappNumber: {
    total: number;
    percentageBasedOnAccepts: string;
  };
  acceptInFirstContactStep: {
    total: number;
    percentageBasedOnAccepts: string;
  };
  outOfBusinessHours: {
    total: number;
    percentageBasedOnAccepts: string;
  };
}

export interface UserCategory {
  total: number;
  percentage: string;
  customCases?: CustomCases;
}

export interface AnalyticsData {
  nonQualifiedInFollowUpUsers: UserCategory;
  qualifiedAcceptUsers: UserCategory;
  qualifiedRejectUsers: UserCategory;
  totalTrackedUsers: number;
  totalHondaConversations: number;
}