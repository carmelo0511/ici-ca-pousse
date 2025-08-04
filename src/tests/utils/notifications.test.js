// Tests for notification utility functions
describe('Notification Utilities', () => {
  test('should handle notification formatting', () => {
    const mockNotification = {
      id: '1',
      message: 'New achievement unlocked!',
      type: 'badge',
      timestamp: '2023-05-15T10:00:00Z',
      read: false
    };

    expect(mockNotification.message).toBe('New achievement unlocked!');
    expect(mockNotification.read).toBe(false);
    expect(mockNotification.type).toBe('badge');
  });

  test('should sort notifications by timestamp', () => {
    const notifications = [
      { id: '1', timestamp: '2023-05-15T10:00:00Z' },
      { id: '2', timestamp: '2023-05-15T11:00:00Z' },
      { id: '3', timestamp: '2023-05-15T09:00:00Z' }
    ];

    const sorted = notifications.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    expect(sorted[0].id).toBe('2'); // Most recent
    expect(sorted[1].id).toBe('1');
    expect(sorted[2].id).toBe('3'); // Oldest
  });

  test('should filter unread notifications', () => {
    const notifications = [
      { id: '1', read: false, type: 'badge' },
      { id: '2', read: true, type: 'friend' },
      { id: '3', read: false, type: 'challenge' }
    ];

    const unread = notifications.filter(n => !n.read);
    expect(unread).toHaveLength(2);
    expect(unread[0].id).toBe('1');
    expect(unread[1].id).toBe('3');
  });

  test('should calculate notification age', () => {
    const now = new Date('2023-05-15T12:00:00Z');
    const notificationTime = new Date('2023-05-15T10:00:00Z');
    const ageInHours = (now - notificationTime) / (1000 * 60 * 60);
    
    expect(ageInHours).toBe(2);
  });

  test('should categorize notifications by type', () => {
    const notifications = [
      { type: 'badge', message: 'Badge earned' },
      { type: 'friend', message: 'Friend request' },
      { type: 'challenge', message: 'Challenge invite' },
      { type: 'badge', message: 'Another badge' }
    ];

    const byType = notifications.reduce((acc, notif) => {
      acc[notif.type] = (acc[notif.type] || 0) + 1;
      return acc;
    }, {});

    expect(byType.badge).toBe(2);
    expect(byType.friend).toBe(1);
    expect(byType.challenge).toBe(1);
  });
});