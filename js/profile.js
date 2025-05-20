// Profile Page Module
const ProfilePage = (() => {
  // DOM Elements
  const profileName = document.getElementById('profileName');
  const profileStats = document.getElementById('profileStats');
  const editProfileBtn = document.getElementById('editProfileBtn');
  const profileEditCard = document.getElementById('profileEditCard');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const profileForm = document.getElementById('profileForm');
  const goalsForm = document.getElementById('goalsForm');
  const stepGoalInput = document.getElementById('stepGoal');
  const calorieGoalInput = document.getElementById('calorieGoal');
  const activeGoalInput = document.getElementById('activeGoal');
  const userNameInput = document.getElementById('userNameInput');
  const userAge = document.getElementById('userAge');
  const userGender = document.getElementById('userGender');
  const userHeight = document.getElementById('userHeight');
  const userWeight = document.getElementById('userWeight');
  
  // User profile data
  let userProfile = null;
  
  // Initialize the profile page
  const init = () => {
    loadUserProfile();
    setupEventListeners();
  };
  
  // Setup event listeners
  const setupEventListeners = () => {
    // Edit profile button
    editProfileBtn.addEventListener('click', toggleProfileEdit);
    
    // Cancel edit button
    cancelEditBtn.addEventListener('click', toggleProfileEdit);
    
    // Profile form submission
    profileForm.addEventListener('submit', handleProfileSubmit);
    
    // Goals form submission
    goalsForm.addEventListener('submit', handleGoalsSubmit);
  };
  
  // Load user profile
  const loadUserProfile = () => {
    userProfile = MockDataService.getUserProfile();
    
    // Update profile display
    updateProfileDisplay();
    
    // Update form values
    updateFormValues();
  };
  
  // Update profile display
  const updateProfileDisplay = () => {
    // Update name
    profileName.textContent = userProfile.name;
    
    // Update stats
    profileStats.textContent = `Age: ${userProfile.age} | Height: ${userProfile.height}cm | Weight: ${userProfile.weight}kg`;
    
    // Update goals
    stepGoalInput.value = userProfile.goals.steps;
    calorieGoalInput.value = userProfile.goals.calories;
    activeGoalInput.value = userProfile.goals.activeMinutes;
  };
  
  // Update form values
  const updateFormValues = () => {
    userNameInput.value = userProfile.name;
    userAge.value = userProfile.age;
    userGender.value = userProfile.gender || '';
    userHeight.value = userProfile.height;
    userWeight.value = userProfile.weight;
  };
  
  // Toggle profile edit
  const toggleProfileEdit = () => {
    profileEditCard.style.display = profileEditCard.style.display === 'none' ? 'block' : 'none';
    
    // If opening the form, reset values
    if (profileEditCard.style.display === 'block') {
      updateFormValues();
    }
  };
  
  // Handle profile form submission
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    
    // Get form values
    const name = userNameInput.value.trim();
    const age = parseInt(userAge.value, 10);
    const gender = userGender.value;
    const height = parseInt(userHeight.value, 10);
    const weight = parseInt(userWeight.value, 10);
    
    // Validate
    if (!name || isNaN(age) || isNaN(height) || isNaN(weight)) {
      App.showNotification(
        'Validation Error', 
        'Please fill in all fields with valid values.', 
        'bi-exclamation-triangle-fill me-2 text-danger'
      );
      return;
    }
    
    // Update user profile
    userProfile.name = name;
    userProfile.age = age;
    userProfile.gender = gender;
    userProfile.height = height;
    userProfile.weight = weight;
    
    // Save to storage
    MockDataService.saveUserProfile(userProfile);
    
    // Update display
    updateProfileDisplay();
    
    // Update user name in header
    document.getElementById('userName').textContent = name.split(' ')[0];
    
    // Show success notification
    App.showNotification(
      'Profile Updated', 
      'Your profile has been successfully updated.', 
      'bi-check-circle-fill me-2 text-success'
    );
    
    // Close edit form
    toggleProfileEdit();
  };
  
  // Handle goals form submission
  const handleGoalsSubmit = (e) => {
    e.preventDefault();
    
    // Get form values
    const stepGoal = parseInt(stepGoalInput.value, 10);
    const calorieGoal = parseInt(calorieGoalInput.value, 10);
    const activeGoal = parseInt(activeGoalInput.value, 10);
    
    // Validate
    if (isNaN(stepGoal) || isNaN(calorieGoal) || isNaN(activeGoal)) {
      App.showNotification(
        'Validation Error', 
        'Please fill in all fields with valid values.', 
        'bi-exclamation-triangle-fill me-2 text-danger'
      );
      return;
    }
    
    // Update user profile
    userProfile.goals.steps = stepGoal;
    userProfile.goals.calories = calorieGoal;
    userProfile.goals.activeMinutes = activeGoal;
    
    // Save to storage
    MockDataService.saveUserProfile(userProfile);
    
    // Show success notification
    App.showNotification(
      'Goals Updated', 
      'Your fitness goals have been successfully updated.', 
      'bi-check-circle-fill me-2 text-success'
    );
    
    // If dashboard is visible, refresh it
    if (document.getElementById('dashboard').classList.contains('active')) {
      DashboardPage.init();
    }
  };
  
  // Return public methods
  return {
    init
  };
})();