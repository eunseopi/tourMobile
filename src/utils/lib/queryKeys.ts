export const QK = {
    sessionMe: ['GET /v1/users/session/me'] as const,
    notificationSettings: ['GET /v1/notification/settings'] as const,
    notificationList: ['GET /v1/notification'] as const,
    notificationUnreadCount: ['GET /v1/notification/unread-count'] as const,
    attendanceCheck: (dateKey: string) =>
        ['POST /v1/attendance/check', dateKey] as const,
    attendanceStatus: ['GET /v1/attendance/status'] as const,

    // 상품 목록
    products: (category?: 'JEJU_TICON' | 'GOODS') => 
        ['GET /v1/products', { category }] as const,
    
    // 단일 상품
    product: (productId: string | number) =>
        ['GET /v1/products/:productId', String(productId)] as const,
    
    // 보유 상품 목록
    myProducts: (userId: string | number) =>
        ['GET /v1/products/my', String(userId ?? '')] as const,
    exchangeDetail: (exchangeId: string | number) =>
        ["GET /v1/products/exchanges/:exchangeId/detail", String(exchangeId)] as const,
    
    acceptToggle: (productId: string | number) =>
        ['POST /v1/products/:productId/accept-toggle', String(productId)] as const,

    communityPosts: (
        tab: 'latest' | 'popular',
        page = 0,
        size = 20,
        typeFilter: 'ALL' | 'POST' | 'SPOT' | 'CHALLENGE' = 'ALL',
    ) => ['GET /api/spots', { tab, page, size, typeFilter }] as const,
    communityBanners: (date?: string) =>
        ['GET /api/community/events/banner', { date }] as const,
    allComments: (spotId: number) =>
        ['GET /api/spots/:spotId/comments/all', spotId] as const,
    
    myPosts: (page = 0, size = 20, sort: 'latest' | 'views' | 'comments' = 'latest') =>
        ['GET /v1/mypage/posts', { page, size, sort }] as const,
    myComments: (page = 0, size = 20) =>
        ['GET /v1/mypage/comments', { page, size }] as const,
    myLikedSpots: (page = 0, size = 20) =>
        ['GET /v1/mypage/liked', { page, size }] as const,

    challengesUpcoming: ['GET /api/challenges/upcoming'] as const,
    challengesOngoing: ['GET /api/challenges/ongoing'] as const,
    challengesCompleted: (size = 20) =>
        ['GET /api/challenges/completed', { size }] as const,
    
    // mutation
    mMyGoods: (userId?: string | number) =>
        ['GET /v1/products/my/goods', String(userId ?? '')] as const,
    mResetPassword: ['POST /v1/users/auth/find/password/reset'] as const,
    mChangeThemes: ['POST /v1/users/account/themes'] as const,
    mChangeNickname: ['POST /v1/users/account/nickname'] as const,
    mUpdateProfileImage: ['PUT /v1/users/profile'] as const,
    mCheckNicknameDuplicate: ['GET /v1/users/register/check/nickname'] as const,
    mNotificationSettings: ['POST /v1/notification/settings'] as const,
    mMarkNotificationRead: ['POST /v1/notification/:id/read'] as const,
    mMarkAllNotificationsRead: ['POST /v1/notification/mark-all-read'] as const,
    mDeleteNotification: ['DELETE /v1/notification/:id'] as const,
    mDeleteAllNotifications: ['DELETE /v1/notification/all'] as const,
    mUpdateFcmToken: ['POST /v1/notification/fcm-token'] as const,
    mStepSave: ['POST /v1/steps'] as const,
    exchangeStatus: ['GET /v1/steps/exchange/status'] as const,
    mChallengeStart: ['POST /api/challenges/:id/start'] as const,
    mChallengeComplete: ['POST /api/challenges/:id/complete'] as const,
    mChallengeRefreshUpcoming: ['POST /api/challenges/upcoming/refresh'] as const,
    mChallengeCancel: ['POST /api/challenges/:id/cancel'] as const,
}
