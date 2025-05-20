// Mock Data Service
const MockDataService = (() => {
  // User Profile Data
  const defaultUserProfile = {
    name: 'Alex Johnson',
    age: 32,
    gender: 'male',
    height: 175, // in cm
    weight: 70, // in kg
    goals: {
      steps: 10000,
      calories: 500,
      activeMinutes: 60
    }
  };

  // Generate a random number between min and max
  const random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Generate activity for a single day
  const generateDailyActivity = (date, userProfile) => {
    const goals = userProfile.goals;
    
    // Generate steps with normal distribution around the goal
    const goalMultiplier = Math.random() * 1.5;
    const steps = Math.floor(goals.steps * (0.6 + (goalMultiplier > 1 ? 1 : goalMultiplier)));
    
    // Calculate calories based on steps and user profile
    const caloriesPerStep = 0.04 + (Math.random() * 0.02);
    const calories = Math.floor(steps * caloriesPerStep);
    
    // Calculate active minutes based on steps
    const activeMinutes = Math.floor(steps / 130);
    
    // Calculate goal statuses
    const stepsGoalMet = steps >= goals.steps;
    const caloriesGoalMet = calories >= goals.calories;
    const activeGoalMet = activeMinutes >= goals.activeMinutes;
    
    return {
      date: date,
      steps: steps,
      calories: calories,
      activeMinutes: activeMinutes,
      goalsMet: {
        steps: stepsGoalMet,
        calories: caloriesGoalMet,
        activeMinutes: activeGoalMet
      },
      hourlyBreakdown: generateHourlyData(steps, calories, activeMinutes)
    };
  };

  // Generate hourly breakdown for a day
  const generateHourlyData = (totalSteps, totalCalories, totalActiveMinutes) => {
    const hourlyData = [];
    let stepsSum = 0;
    let caloriesSum = 0;
    let activeSum = 0;
    
    // Distribution weights based on typical activity patterns throughout day
    const hourlyDistribution = [
      0.01, 0.005, 0.005, 0.005, 0.01, 0.02, // 0-5 AM (sleeping)
      0.05, 0.07, 0.06, 0.04, 0.04, 0.05,    // 6-11 AM (morning)
      0.07, 0.06, 0.04, 0.05, 0.07, 0.09,    // 12-5 PM (afternoon)
      0.1, 0.12, 0.08, 0.06, 0.04, 0.02      // 6-11 PM (evening)
    ];
    
    // Generate data for each hour with some random variation
    for (let hour = 0; hour < 24; hour++) {
      const baseWeight = hourlyDistribution[hour];
      const weight = baseWeight * (0.8 + Math.random() * 0.4); // Add randomness
      
      const hourSteps = Math.floor(totalSteps * weight);
      const hourCalories = Math.floor(totalCalories * weight);
      const hourActive = Math.floor(totalActiveMinutes * weight);
      
      stepsSum += hourSteps;
      caloriesSum += hourCalories;
      activeSum += hourActive;
      
      hourlyData.push({
        hour,
        steps: hourSteps,
        calories: hourCalories,
        activeMinutes: hourActive
      });
    }
    
    // Adjust the last hour to make sure totals match
    const lastHour = hourlyData[23];
    lastHour.steps += (totalSteps - stepsSum);
    lastHour.calories += (totalCalories - caloriesSum);
    lastHour.activeMinutes += (totalActiveMinutes - activeSum);
    
    return hourlyData;
  };

  // Generate activity data for a date range
  const generateActivityHistory = (days, userProfile) => {
    const today = new Date();
    const activities = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      activities.push(generateDailyActivity(date, userProfile));
    }
    
    return activities;
  };

  // Generate health metrics
  const generateHealthMetrics = (userProfile) => {
    const { age, gender, weight, height } = userProfile;
    
    // Calculate BMI
    const bmi = weight / ((height / 100) ** 2);
    
    // Estimate resting heart rate based on age and fitness level
    const baseHeartRate = gender === 'male' ? 73 : 78;
    const fitnessAdjustment = random(-15, 5);
    const restingHeartRate = baseHeartRate + fitnessAdjustment + Math.floor(age / 10);
    
    // Sleep quality (hours)
    const sleepHours = 6.5 + (Math.random() * 2);
    
    // Water intake (in ml)
    const waterIntake = random(1800, 2800);
    
    return {
      bmi: parseFloat(bmi.toFixed(1)),
      restingHeartRate,
      sleepHours: parseFloat(sleepHours.toFixed(1)),
      waterIntake
    };
  };

  // Generate achievements based on activity history
  const generateAchievements = (activityHistory, userProfile) => {
    const achievements = [];
    
    // Check for step goals achieved
    const stepsGoalDays = activityHistory.filter(day => day.goalsMet.steps).length;
    if (stepsGoalDays > 0) {
      achievements.push({
        id: 'steps-goal',
        title: 'Step Master',
        description: `Reached your step goal ${stepsGoalDays} time${stepsGoalDays === 1 ? '' : 's'} this week.`,
        icon: 'bi-footprints'
      });
    }
    
    // Check for consistent activity
    const consecutiveDays = calculateConsecutiveDays(activityHistory);
    if (consecutiveDays >= 3) {
      achievements.push({
        id: 'active-streak',
        title: 'Consistency Champion',
        description: `Active for ${consecutiveDays} consecutive days!`,
        icon: 'bi-calendar-check'
      });
    }
    
    // Check for high step days
    const highStepDay = activityHistory.find(day => day.steps > userProfile.goals.steps * 1.5);
    if (highStepDay) {
      achievements.push({
        id: 'high-stepper',
        title: 'Overachiever',
        description: `Exceeded your step goal by 50% in a single day!`,
        icon: 'bi-trophy'
      });
    }
    
    // Check for calories burned milestone
    const totalCalories = activityHistory.reduce((sum, day) => sum + day.calories, 0);
    if (totalCalories > 3000) {
      achievements.push({
        id: 'calorie-burner',
        title: 'Calorie Crusher',
        description: `Burned over 3,000 calories this week!`,
        icon: 'bi-fire'
      });
    }
    
    return achievements;
  };

  // Calculate consecutive active days
  const calculateConsecutiveDays = (activityHistory) => {
    let streak = 1;
    let maxStreak = 1;
    
    for (let i = 1; i < activityHistory.length; i++) {
      const prevDay = new Date(activityHistory[i-1].date);
      const currDay = new Date(activityHistory[i].date);
      
      // Check if consecutive days and if any goal was met
      const isConsecutive = (currDay.getTime() - prevDay.getTime()) === 86400000;
      const isActive = activityHistory[i].goalsMet.steps || 
                      activityHistory[i].goalsMet.calories || 
                      activityHistory[i].goalsMet.activeMinutes;
      
      if (isConsecutive && isActive) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else {
        streak = 1;
      }
    }
    
    return maxStreak;
  };

  // Public API
  return {
    getUserProfile() {
      // Try to get from localStorage first
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        return JSON.parse(storedProfile);
      }
      // Otherwise return default
      return defaultUserProfile;
    },
    
    saveUserProfile(profile) {
      localStorage.setItem('userProfile', JSON.stringify(profile));
      return profile;
    },
    
    getTodayActivity() {
      const userProfile = this.getUserProfile();
      return generateDailyActivity(new Date(), userProfile);
    },
    
    getActivityHistory(days = 7) {
      const userProfile = this.getUserProfile();
      return generateActivityHistory(days, userProfile);
    },
    
    getHealthMetrics() {
      const userProfile = this.getUserProfile();
      return generateHealthMetrics(userProfile);
    },
    
    getAchievements() {
      const userProfile = this.getUserProfile();
      const activityHistory = this.getActivityHistory(7);
      return generateAchievements(activityHistory, userProfile);
    },
    
    // Method to use when we need to update activity data (e.g., for simulations)
    refreshActivityData() {
      return this.getTodayActivity();
    }
  };
})();