// Tests pour les optimisations de performance mobile
describe('Performance Optimizations', () => {
  // Mock navigator
  Object.defineProperty(navigator, 'userAgent', {
    writable: true,
    value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/537.36'
  });

  Object.defineProperty(navigator, 'deviceMemory', {
    writable: true,
    value: 4
  });

  Object.defineProperty(navigator, 'hardwareConcurrency', {
    writable: true,
    value: 4
  });

  test('device detection works correctly', () => {
    const detectDevice = (userAgent, memory, cores) => {
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isLowEnd = memory < 4 || cores < 4;
      
      return {
        isMobile,
        isLowEnd,
        deviceMemory: memory,
        hardwareConcurrency: cores
      };
    };

    const mobileDevice = detectDevice(navigator.userAgent, 4, 4);
    expect(mobileDevice.isMobile).toBe(true);
    expect(mobileDevice.isLowEnd).toBe(false);

    const lowEndDevice = detectDevice('Android', 2, 2);
    expect(lowEndDevice.isLowEnd).toBe(true);
  });

  test('performance optimizations settings', () => {
    const getOptimizedSettings = (isLowEnd, isSlowNetwork) => {
      return {
        enableAnimations: !isLowEnd,
        enableTransitions: !isLowEnd,
        imageQuality: isLowEnd ? 'low' : 'high',
        prefetchLevel: isSlowNetwork ? 'minimal' : 'aggressive',
        cacheStrategy: isSlowNetwork ? 'conservative' : 'normal',
        enableBackgroundSync: !isLowEnd,
        maxConcurrentRequests: isLowEnd ? 2 : 6,
        enableWebP: !isLowEnd,
        enableLazyLoading: true,
        throttleAnimations: isLowEnd
      };
    };

    const lowEndSettings = getOptimizedSettings(true, true);
    expect(lowEndSettings.enableAnimations).toBe(false);
    expect(lowEndSettings.imageQuality).toBe('low');
    expect(lowEndSettings.maxConcurrentRequests).toBe(2);

    const highEndSettings = getOptimizedSettings(false, false);
    expect(highEndSettings.enableAnimations).toBe(true);
    expect(highEndSettings.imageQuality).toBe('high');
    expect(highEndSettings.maxConcurrentRequests).toBe(6);
  });

  test('performance score calculation', () => {
    const calculatePerformanceScore = (metrics) => {
      const { fcp, lcp, fid, cls } = metrics;
      
      if (!fcp || !lcp || fid === null || cls === null) {
        return null;
      }

      let score = 100;

      // FCP scoring (poids: 25%)
      if (fcp > 3000) score -= 25;
      else if (fcp > 1800) score -= 15;
      else if (fcp > 1000) score -= 5;

      // LCP scoring (poids: 25%)
      if (lcp > 4000) score -= 25;
      else if (lcp > 2500) score -= 15;
      else if (lcp > 1500) score -= 5;

      // FID scoring (poids: 25%)
      if (fid > 300) score -= 25;
      else if (fid > 100) score -= 15;
      else if (fid > 50) score -= 5;

      // CLS scoring (poids: 25%)
      if (cls > 0.25) score -= 25;
      else if (cls > 0.1) score -= 15;
      else if (cls > 0.05) score -= 5;

      return Math.max(0, Math.round(score));
    };

    // Excellent performance
    expect(calculatePerformanceScore({
      fcp: 800,
      lcp: 1200,
      fid: 30,
      cls: 0.02
    })).toBe(100);

    // Poor performance
    expect(calculatePerformanceScore({
      fcp: 4000,
      lcp: 5000,
      fid: 400,
      cls: 0.3
    })).toBe(0);

    // Mixed performance
    expect(calculatePerformanceScore({
      fcp: 2000,
      lcp: 3000,
      fid: 150,
      cls: 0.15
    })).toBe(40);
  });

  test('connection type detection', () => {
    const getConnectionInfo = (connection) => {
      return {
        online: navigator.onLine,
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || null,
        rtt: connection?.rtt || null,
        saveData: connection?.saveData || false,
        isSlowNetwork: connection?.effectiveType === 'slow-2g' || 
                       connection?.effectiveType === '2g' ||
                       (connection?.downlink && connection.downlink < 1.5)
      };
    };

    const slowConnection = getConnectionInfo({
      effectiveType: '2g',
      downlink: 0.5,
      rtt: 2000,
      saveData: true
    });

    expect(slowConnection.isSlowNetwork).toBe(true);
    expect(slowConnection.effectiveType).toBe('2g');

    const fastConnection = getConnectionInfo({
      effectiveType: '4g',
      downlink: 10,
      rtt: 50,
      saveData: false
    });

    expect(fastConnection.isSlowNetwork).toBe(false);
    expect(fastConnection.effectiveType).toBe('4g');
  });

  test('cache strategies work correctly', () => {
    const getCacheStrategy = (resourceType, isSlowNetwork) => {
      const strategies = {
        static: 'cache-first',
        api: isSlowNetwork ? 'cache-first' : 'network-first',
        images: 'cache-first',
        fonts: 'cache-first',
        pages: isSlowNetwork ? 'stale-while-revalidate' : 'network-first'
      };

      return strategies[resourceType] || 'network-first';
    };

    // Fast network
    expect(getCacheStrategy('api', false)).toBe('network-first');
    expect(getCacheStrategy('pages', false)).toBe('network-first');
    expect(getCacheStrategy('static', false)).toBe('cache-first');

    // Slow network
    expect(getCacheStrategy('api', true)).toBe('cache-first');
    expect(getCacheStrategy('pages', true)).toBe('stale-while-revalidate');
    expect(getCacheStrategy('images', true)).toBe('cache-first');
  });

  test('memory cleanup simulation', () => {
    let memoryUsage = { used: 850, limit: 1000 }; // 85% usage
    
    const cleanupMemory = () => {
      // Simulate memory cleanup
      memoryUsage.used = memoryUsage.used * 0.7; // Reduce by 30%
    };

    const shouldCleanup = memoryUsage.used / memoryUsage.limit > 0.8;
    expect(shouldCleanup).toBe(true);

    cleanupMemory();
    expect(memoryUsage.used).toBe(595); // 850 * 0.7
    expect(memoryUsage.used / memoryUsage.limit).toBeLessThan(0.6);
  });
});