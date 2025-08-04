// Service de limitation des appels API pour le chatbot
class APIRateLimiter {
  constructor() {
    this.dailyLimit = 50; // Limite quotidienne d'appels API
    this.hourlyLimit = 10; // Limite horaire d'appels API
    this.minuteLimit = 3; // Limite par minute
    this.resetDaily();
    this.loadFromStorage();
  }

  resetDaily() {
    const today = new Date().toDateString();
    if (this.lastResetDay !== today) {
      this.dailyCount = 0;
      this.hourlyCount = 0;
      this.minuteCount = 0;
      this.lastResetDay = today;
      this.lastResetHour = new Date().getHours();
      this.lastResetMinute = new Date().getMinutes();
      this.saveToStorage();
    }
  }

  resetHourly() {
    const currentHour = new Date().getHours();
    if (this.lastResetHour !== currentHour) {
      this.hourlyCount = 0;
      this.lastResetHour = currentHour;
      this.saveToStorage();
    }
  }

  resetMinute() {
    const currentMinute = new Date().getMinutes();
    if (this.lastResetMinute !== currentMinute) {
      this.minuteCount = 0;
      this.lastResetMinute = currentMinute;
      this.saveToStorage();
    }
  }

  canMakeRequest() {
    this.resetDaily();
    this.resetHourly();
    this.resetMinute();

    return {
      canProceed: this.dailyCount < this.dailyLimit && 
                  this.hourlyCount < this.hourlyLimit && 
                  this.minuteCount < this.minuteLimit,
      dailyRemaining: this.dailyLimit - this.dailyCount,
      hourlyRemaining: this.hourlyLimit - this.hourlyCount,
      minuteRemaining: this.minuteLimit - this.minuteCount,
      limits: {
        daily: this.dailyLimit,
        hourly: this.hourlyLimit,
        minute: this.minuteLimit
      },
      used: {
        daily: this.dailyCount,
        hourly: this.hourlyCount,
        minute: this.minuteCount
      }
    };
  }

  recordRequest() {
    this.dailyCount++;
    this.hourlyCount++;
    this.minuteCount++;
    this.saveToStorage();
  }

  getStats() {
    return {
      daily: { 
        used: this.dailyCount, 
        limit: this.dailyLimit, 
        remaining: this.dailyLimit - this.dailyCount 
      },
      hourly: { 
        used: this.hourlyCount, 
        limit: this.hourlyLimit, 
        remaining: this.hourlyLimit - this.hourlyCount 
      },
      minute: { 
        used: this.minuteCount, 
        limit: this.minuteLimit, 
        remaining: this.minuteLimit - this.minuteCount 
      }
    };
  }

  getUsagePercentage() {
    return {
      daily: Math.round((this.dailyCount / this.dailyLimit) * 100),
      hourly: Math.round((this.hourlyCount / this.hourlyLimit) * 100),
      minute: Math.round((this.minuteCount / this.minuteLimit) * 100)
    };
  }

  isNearLimit() {
    const percentages = this.getUsagePercentage();
    return {
      daily: percentages.daily >= 80,
      hourly: percentages.hourly >= 80,
      minute: percentages.minute >= 80
    };
  }

  resetLimits() {
    this.dailyCount = 0;
    this.hourlyCount = 0;
    this.minuteCount = 0;
    this.lastResetDay = new Date().toDateString();
    this.lastResetHour = new Date().getHours();
    this.lastResetMinute = new Date().getMinutes();
    this.saveToStorage();
  }

  updateLimits(newLimits) {
    if (newLimits.daily) this.dailyLimit = newLimits.daily;
    if (newLimits.hourly) this.hourlyLimit = newLimits.hourly;
    if (newLimits.minute) this.minuteLimit = newLimits.minute;
    this.saveToStorage();
  }

  saveToStorage() {
    try {
      const data = {
        dailyCount: this.dailyCount,
        hourlyCount: this.hourlyCount,
        minuteCount: this.minuteCount,
        lastResetDay: this.lastResetDay,
        lastResetHour: this.lastResetHour,
        lastResetMinute: this.lastResetMinute,
        limits: {
          daily: this.dailyLimit,
          hourly: this.hourlyLimit,
          minute: this.minuteLimit
        }
      };
      localStorage.setItem('api_rate_limiter', JSON.stringify(data));
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde des limites API:', error);
    }
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem('api_rate_limiter');
      if (data) {
        const parsed = JSON.parse(data);
        this.dailyCount = parsed.dailyCount || 0;
        this.hourlyCount = parsed.hourlyCount || 0;
        this.minuteCount = parsed.minuteCount || 0;
        this.lastResetDay = parsed.lastResetDay;
        this.lastResetHour = parsed.lastResetHour;
        this.lastResetMinute = parsed.lastResetMinute;
        
        // Charger les limites personnalisées si elles existent
        if (parsed.limits) {
          this.dailyLimit = parsed.limits.daily || this.dailyLimit;
          this.hourlyLimit = parsed.limits.hourly || this.hourlyLimit;
          this.minuteLimit = parsed.limits.minute || this.minuteLimit;
        }
      }
    } catch (error) {
      console.warn('Erreur lors du chargement des limites API:', error);
      this.resetDaily();
    }
  }
}

// Instance singleton
const apiRateLimiter = new APIRateLimiter();

export default apiRateLimiter; 