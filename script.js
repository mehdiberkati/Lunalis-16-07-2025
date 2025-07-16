class MyRPGLifeApp {
  constructor() {
    this.data = this.loadData();
    this.timer = null;
    this.timerState = {
      isRunning: false,
      isPaused: false,
      duration: 25 * 60, // 25 minutes en secondes
      remaining: 25 * 60,
      currentProject: null
    };
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateUI();
    this.startAutoSave();
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const section = e.currentTarget.dataset.section;
        this.showSection(section);
      });
    });

    // Boutons d'action du dashboard
    const sportBtn = document.getElementById('sportBtn');
    if (sportBtn) {
      sportBtn.addEventListener('click', () => this.logSport());
    }

    const sleepBtn = document.getElementById('sleepBtn');
    if (sleepBtn) {
      sleepBtn.addEventListener('click', () => this.showSleepModal());
    }

    // Bouton focus principal
    const focusStartBtn = document.getElementById('focusStartBtn');
    if (focusStartBtn) {
      focusStartBtn.addEventListener('click', () => this.showSection('focus'));
    }

    // Timer controls
    const startPauseBtn = document.getElementById('startPauseBtn');
    if (startPauseBtn) {
      startPauseBtn.addEventListener('click', () => this.toggleTimer());
    }

    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetTimer());
    }

    // Duration controls
    const decreaseBtn = document.getElementById('decreaseDurationBtn');
    const increaseBtn = document.getElementById('increaseDurationBtn');
    
    if (decreaseBtn) {
      decreaseBtn.addEventListener('click', () => this.adjustDuration(-5));
    }
    
    if (increaseBtn) {
      increaseBtn.addEventListener('click', () => this.adjustDuration(5));
    }

    // Project management
    const createProjectBtn = document.getElementById('createProjectBtn');
    if (createProjectBtn) {
      createProjectBtn.addEventListener('click', () => this.showProjectForm());
    }

    // Weekly review
    const weeklyReviewBtn = document.getElementById('weeklyReviewBtn');
    if (weeklyReviewBtn) {
      weeklyReviewBtn.addEventListener('click', () => this.goToWeeklyReview());
    }

    // Modal overlay
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          this.closeModal();
        }
      });
    }
  }

  showSection(sectionName) {
    // Masquer toutes les sections
    document.querySelectorAll('.content-section').forEach(section => {
      section.classList.remove('active');
    });

    // Désactiver tous les boutons de navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // Afficher la section demandée
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // Activer le bouton de navigation correspondant
    const targetBtn = document.querySelector(`[data-section="${sectionName}"]`);
    if (targetBtn) {
      targetBtn.classList.add('active');
    }

    // Actions spécifiques selon la section
    switch (sectionName) {
      case 'projects':
        this.renderProjects();
        break;
      case 'achievements':
        this.renderAchievements();
        break;
      case 'progression':
        this.renderProgression();
        break;
      case 'weekly':
        this.renderWeeklyReview();
        break;
      case 'settings':
        this.renderSettings();
        break;
    }
  }

  // Actions du dashboard
  logSport() {
    const today = new Date().toDateString();
    if (!this.data.dailyActions[today]) {
      this.data.dailyActions[today] = {};
    }
    
    if (!this.data.dailyActions[today].sport) {
      this.data.dailyActions[today].sport = true;
      this.addXP(3, 'Sport (50min)');
      this.showNotification('💪 +3 XP pour le sport !', 'success');
      this.updateUI();
    } else {
      this.showNotification('Sport déjà enregistré aujourd\'hui', 'info');
    }
  }

  showSleepModal() {
    const modalContent = `
      <div class="modal-header">
        <h3>😴 Enregistrer le Sommeil</h3>
        <button class="modal-close" onclick="app.closeModal()">×</button>
      </div>
      <div class="modal-body">
        <div class="sleep-options">
          <button class="sleep-btn good" onclick="app.logSleep('good')">
            <span class="sleep-icon">🌙</span>
            <div class="sleep-info">
              <strong>Bon sommeil</strong>
              <small>>7h avant 22h</small>
            </div>
            <span class="sleep-xp">+2 XP</span>
          </button>
          
          <button class="sleep-btn average" onclick="app.logSleep('average')">
            <span class="sleep-icon">😴</span>
            <div class="sleep-info">
              <strong>Sommeil correct</strong>
              <small>>7h avant minuit</small>
            </div>
            <span class="sleep-xp">+1 XP</span>
          </button>
          
          <button class="sleep-btn bad" onclick="app.logSleep('bad')">
            <span class="sleep-icon">😵</span>
            <div class="sleep-info">
              <strong>Mauvais sommeil</strong>
              <small><7h ou après minuit</small>
            </div>
            <span class="sleep-xp">0 XP</span>
          </button>
        </div>
      </div>
    `;
    
    this.showModal(modalContent);
  }

  logSleep(quality) {
    const today = new Date().toDateString();
    if (!this.data.dailyActions[today]) {
      this.data.dailyActions[today] = {};
    }
    
    if (!this.data.dailyActions[today].sleep) {
      this.data.dailyActions[today].sleep = quality;
      
      let xp = 0;
      let message = '';
      
      switch (quality) {
        case 'good':
          xp = 2;
          message = '🌙 +2 XP pour un excellent sommeil !';
          break;
        case 'average':
          xp = 1;
          message = '😴 +1 XP pour un sommeil correct';
          break;
        case 'bad':
          xp = 0;
          message = '😵 Aucun XP - Essayez de mieux dormir demain';
          break;
      }
      
      if (xp > 0) {
        this.addXP(xp, `Sommeil ${quality}`);
      }
      
      this.showNotification(message, xp > 0 ? 'success' : 'warning');
      this.closeModal();
      this.updateUI();
    } else {
      this.showNotification('Sommeil déjà enregistré aujourd\'hui', 'info');
      this.closeModal();
    }
  }

  showDistractionModal() {
    const modalContent = `
      <div class="modal-header">
        <h3>📱 Déclarer des Distractions</h3>
        <button class="modal-close" onclick="app.closeModal()">×</button>
      </div>
      <div class="modal-body">
        <div class="distraction-options">
          <button class="distraction-btn instagram" onclick="app.logDistraction('instagram')">
            <span class="distraction-icon">📸</span>
            <div class="distraction-info">
              <strong>Instagram +1h</strong>
              <small>Perte de temps sur les réseaux</small>
            </div>
            <span class="distraction-penalty">-3 XP</span>
          </button>
          
          <button class="distraction-btn music" onclick="app.logDistraction('music')">
            <span class="distraction-icon">🎵</span>
            <div class="distraction-info">
              <strong>Musique +1h30</strong>
              <small>Écoute excessive de musique</small>
            </div>
            <span class="distraction-penalty">-5 XP</span>
          </button>
        </div>
      </div>
    `;
    
    this.showModal(modalContent);
  }

  logDistraction(type) {
    const today = new Date().toDateString();
    if (!this.data.dailyActions[today]) {
      this.data.dailyActions[today] = {};
    }
    
    if (!this.data.dailyActions[today].distractions) {
      this.data.dailyActions[today].distractions = [];
    }
    
    let penalty = 0;
    let message = '';
    
    switch (type) {
      case 'instagram':
        penalty = 3;
        message = '📸 -3 XP pour Instagram';
        break;
      case 'music':
        penalty = 5;
        message = '🎵 -5 XP pour musique excessive';
        break;
    }
    
    this.data.dailyActions[today].distractions.push(type);
    this.addXP(-penalty, `Distraction ${type}`);
    this.showNotification(message, 'error');
    this.closeModal();
    this.updateUI();
  }

  // Timer functions
  toggleTimer() {
    if (!this.timerState.isRunning) {
      this.startTimer();
    } else {
      this.pauseTimer();
    }
  }

  startTimer() {
    this.timerState.isRunning = true;
    this.timerState.isPaused = false;
    
    const startPauseBtn = document.getElementById('startPauseBtn');
    const startPauseText = document.getElementById('startPauseText');
    
    if (startPauseBtn && startPauseText) {
      startPauseBtn.classList.add('running');
      startPauseText.textContent = 'Pause';
    }
    
    this.timer = setInterval(() => {
      this.timerState.remaining--;
      this.updateTimerDisplay();
      
      if (this.timerState.remaining <= 0) {
        this.completeTimer();
      }
    }, 1000);
  }

  pauseTimer() {
    this.timerState.isRunning = false;
    this.timerState.isPaused = true;
    
    const startPauseBtn = document.getElementById('startPauseBtn');
    const startPauseText = document.getElementById('startPauseText');
    
    if (startPauseBtn && startPauseText) {
      startPauseBtn.classList.remove('running');
      startPauseText.textContent = 'Reprendre';
    }
    
    clearInterval(this.timer);
  }

  resetTimer() {
    this.timerState.isRunning = false;
    this.timerState.isPaused = false;
    this.timerState.remaining = this.timerState.duration;
    
    const startPauseBtn = document.getElementById('startPauseBtn');
    const startPauseText = document.getElementById('startPauseText');
    
    if (startPauseBtn && startPauseText) {
      startPauseBtn.classList.remove('running');
      startPauseText.textContent = 'Commencer Focus';
    }
    
    clearInterval(this.timer);
    this.updateTimerDisplay();
  }

  completeTimer() {
    clearInterval(this.timer);
    
    const minutes = this.timerState.duration / 60;
    const xpGained = this.calculateFocusXP(minutes);
    
    this.addXP(xpGained, `Session Focus ${minutes}min`);
    this.recordFocusSession(minutes);
    
    this.showNotification(`🎯 Session terminée ! +${xpGained} XP`, 'success');
    this.resetTimer();
  }

  adjustDuration(minutes) {
    if (!this.timerState.isRunning) {
      const newDuration = Math.max(15, Math.min(120, (this.timerState.duration / 60) + minutes)) * 60;
      this.timerState.duration = newDuration;
      this.timerState.remaining = newDuration;
      
      const durationDisplay = document.getElementById('durationDisplay');
      if (durationDisplay) {
        durationDisplay.textContent = `${newDuration / 60} min`;
      }
      
      this.updateTimerDisplay();
    }
  }

  updateTimerDisplay() {
    const minutes = Math.floor(this.timerState.remaining / 60);
    const seconds = this.timerState.remaining % 60;
    
    const timerTime = document.getElementById('timerTime');
    if (timerTime) {
      timerTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    const timerXPPreview = document.getElementById('timerXPPreview');
    if (timerXPPreview) {
      const totalMinutes = this.timerState.duration / 60;
      const xp = this.calculateFocusXP(totalMinutes);
      timerXPPreview.textContent = `+${xp} XP`;
    }
    
    // Update progress circle
    const progress = ((this.timerState.duration - this.timerState.remaining) / this.timerState.duration) * 100;
    const timerProgress = document.getElementById('timerProgress');
    if (timerProgress) {
      const circumference = 2 * Math.PI * 90;
      const offset = circumference - (progress / 100) * circumference;
      timerProgress.style.strokeDasharray = circumference;
      timerProgress.style.strokeDashoffset = offset;
    }
  }

  // Utility functions
  calculateFocusXP(minutes) {
    const baseXP = Math.floor(minutes / 18);
    const mandatorySessions = this.getMandatorySessionsToday();
    return mandatorySessions >= 2 ? baseXP * 2 : baseXP;
  }

  getMandatorySessionsToday() {
    const today = new Date().toDateString();
    return this.data.focusSessions.filter(session => 
      new Date(session.date).toDateString() === today && session.duration >= 90
    ).length;
  }

  recordFocusSession(minutes) {
    this.data.focusSessions.push({
      date: new Date().toISOString(),
      duration: minutes,
      project: this.timerState.currentProject
    });
  }

  addXP(amount, reason) {
    this.data.totalXP += amount;
    this.data.dailyXP += amount;
    
    // Log XP change
    this.data.xpHistory.push({
      date: new Date().toISOString(),
      amount: amount,
      reason: reason,
      total: this.data.totalXP
    });
  }

  // Project management
  showProjectForm() {
    this.showSection('projects');
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
      projectForm.style.display = 'block';
    }
  }

  saveProject() {
    const nameInput = document.getElementById('projectName');
    const descInput = document.getElementById('projectDescription');
    
    if (nameInput && nameInput.value.trim()) {
      const project = {
        id: Date.now(),
        name: nameInput.value.trim(),
        description: descInput ? descInput.value.trim() : '',
        createdAt: new Date().toISOString(),
        totalTime: 0
      };
      
      this.data.projects.push(project);
      this.showNotification('Projet créé avec succès !', 'success');
      this.cancelProject();
      this.renderProjects();
    }
  }

  cancelProject() {
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
      projectForm.style.display = 'none';
    }
    
    const nameInput = document.getElementById('projectName');
    const descInput = document.getElementById('projectDescription');
    
    if (nameInput) nameInput.value = '';
    if (descInput) descInput.value = '';
  }

  renderProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    if (!projectsGrid) return;
    
    if (this.data.projects.length === 0) {
      projectsGrid.innerHTML = `
        <div class="no-projects">
          <p>Aucun projet créé pour le moment.</p>
          <p>Créez votre premier projet pour commencer à tracker votre temps !</p>
        </div>
      `;
      return;
    }
    
    projectsGrid.innerHTML = this.data.projects.map(project => `
      <div class="project-card">
        <h3>${project.name}</h3>
        <p>${project.description || 'Aucune description'}</p>
        <div class="project-stats">
          <span>Temps total: ${Math.floor(project.totalTime / 60)}h ${project.totalTime % 60}min</span>
        </div>
      </div>
    `).join('');
  }

  // Modal functions
  showModal(content) {
    const modal = document.getElementById('modal');
    const modalOverlay = document.getElementById('modalOverlay');
    
    if (modal && modalOverlay) {
      modal.innerHTML = content;
      modalOverlay.style.display = 'flex';
    }
  }

  closeModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
      modalOverlay.style.display = 'none';
    }
  }

  // Notification system
  showNotification(message, type = 'info') {
    const container = document.getElementById('notifications');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        container.removeChild(notification);
      }, 300);
    }, 3000);
  }

  // Weekly review
  goToWeeklyReview() {
    this.showSection('weekly');
  }

  renderWeeklyReview() {
    // Implementation for weekly review
  }

  renderAchievements() {
    // Implementation for achievements
  }

  renderProgression() {
    // Implementation for progression
  }

  renderSettings() {
    // Implementation for settings
  }

  // UI Updates
  updateUI() {
    this.updateDashboard();
    this.updateTimerDisplay();
  }

  updateDashboard() {
    // Update XP display
    const currentXPEl = document.getElementById('currentXP');
    const dailyXPEl = document.getElementById('dailyXP');
    
    if (currentXPEl) currentXPEl.textContent = this.data.totalXP;
    if (dailyXPEl) dailyXPEl.textContent = this.data.dailyXP;
    
    // Update challenge progress
    const challengeFill = document.getElementById('challengeFill');
    const challengeStatus = document.getElementById('challengeStatus');
    
    if (challengeFill && challengeStatus) {
      const progress = Math.min(100, (this.data.dailyXP / 15) * 100);
      challengeFill.style.width = `${progress}%`;
      challengeStatus.textContent = `${this.data.dailyXP}/15 XP`;
    }
    
    // Update rank info
    this.updateRankDisplay();
  }

  updateRankDisplay() {
    const ranks = [
      { name: 'Paumé', xp: 0, badge: 'E', avatar: '😵' },
      { name: 'Apprenti', xp: 100, badge: 'D', avatar: '🎯' },
      { name: 'Disciple', xp: 300, badge: 'C', avatar: '⚡' },
      { name: 'Adepte', xp: 600, badge: 'B', avatar: '🔥' },
      { name: 'Expert', xp: 1000, badge: 'A', avatar: '💎' },
      { name: 'Virtuose', xp: 1500, badge: 'S', avatar: '👑' },
      { name: 'Légende', xp: 2200, badge: 'SS', avatar: '🌟' },
      { name: 'Élu du Destin', xp: 3000, badge: 'SSS', avatar: '🌙' }
    ];
    
    let currentRank = ranks[0];
    for (let i = ranks.length - 1; i >= 0; i--) {
      if (this.data.totalXP >= ranks[i].xp) {
        currentRank = ranks[i];
        break;
      }
    }
    
    const rankName = document.getElementById('rankName');
    const rankBadge = document.getElementById('rankBadge');
    const userAvatar = document.getElementById('userAvatar');
    
    if (rankName) rankName.textContent = currentRank.name;
    if (rankBadge) rankBadge.textContent = currentRank.badge;
    if (userAvatar) userAvatar.textContent = currentRank.avatar;
  }

  // Data management
  loadData() {
    const defaultData = {
      totalXP: 0,
      dailyXP: 0,
      projects: [],
      focusSessions: [],
      dailyActions: {},
      xpHistory: [],
      achievements: [],
      weeklyReviews: []
    };
    
    try {
      const saved = localStorage.getItem('myRPGLifeData');
      return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;
    } catch (error) {
      console.error('Error loading data:', error);
      return defaultData;
    }
  }

  saveData() {
    try {
      localStorage.setItem('myRPGLifeData', JSON.stringify(this.data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  startAutoSave() {
    setInterval(() => {
      this.saveData();
    }, 30000); // Save every 30 seconds
  }

  // Double or Nothing functions
  chooseSafeReward() {
    this.addXP(5, 'Coffre Mystique - Récompense Sûre');
    this.showNotification('✨ +5 XP de récompense sûre !', 'success');
    this.hideDoubleOrNothingChest();
  }

  chooseDoubleOrNothing() {
    // Show challenge details
    const challengeDetails = document.getElementById('challengeDetails');
    if (challengeDetails) {
      challengeDetails.style.display = 'block';
    }
    
    // Set up tomorrow's challenge
    this.data.doubleOrNothingActive = true;
    this.showNotification('🔥 Défi accepté ! Bonne chance demain !', 'warning');
  }

  hideDoubleOrNothingChest() {
    const chest = document.getElementById('doubleOrNothingChest');
    if (chest) {
      chest.style.display = 'none';
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new MyRPGLifeApp();
});