// MyRPGLife 3 - Lunalis - Système de gamification avancé
class MyRPGLife {
    constructor() {
        this.data = this.loadData();
        this.timer = {
            isRunning: false,
            isPaused: false,
            currentTime: 0,
            totalTime: 25 * 60, // 25 minutes par défaut
            interval: null,
            type: 'focus', // 'focus' ou 'break'
            breakCount: 0,
            totalBreaks: 0,
            associatedProjects: [],
            currentProject: null
        };
        
        this.projects = this.loadProjects();
        
        this.ranks = [
            { name: 'Paumé', title: 'Novice', badge: 'E', minXP: 0, color: '#666', avatar: '🎯' },
            { name: 'Apprenti', title: 'Débutant', badge: 'D', minXP: 100, color: '#8B4513', avatar: '⚡' },
            { name: 'Disciple', title: 'Étudiant', badge: 'C', minXP: 300, color: '#4169E1', avatar: '🔥' },
            { name: 'Adepte', title: 'Pratiquant', badge: 'B', minXP: 600, color: '#32CD32', avatar: '💎' },
            { name: 'Expert', title: 'Maître', badge: 'A', minXP: 1000, color: '#FFD700', avatar: '👑' },
            { name: 'Virtuose', title: 'Grand Maître', badge: 'S', minXP: 1500, color: '#FF6347', avatar: '🌟' },
            { name: 'Légende', title: 'Sage', badge: 'SS', minXP: 2200, color: '#9932CC', avatar: '🔮' },
            { name: 'Élu du Destin', title: 'Transcendant', badge: 'SSS', minXP: 3000, color: '#00FFFF', avatar: '🌙' }
        ];
        
        this.achievements = [
            // Faciles
            { id: 'first_focus', name: 'Premiers Pas', description: 'Première session de focus', xp: 5, difficulty: 'facile', unlocked: false },
            { id: 'early_bird', name: 'Lève-tôt', description: 'Session avant 7h du matin', xp: 10, difficulty: 'facile', unlocked: false },
            { id: 'daily_goal', name: 'Objectif Quotidien', description: 'Atteindre 15 XP en une journée', xp: 15, difficulty: 'facile', unlocked: false },
            
            // Moyens
            { id: 'focus_hunter', name: 'Chasseur de Focus', description: '10 sessions de focus', xp: 25, difficulty: 'moyen', unlocked: false },
            { id: 'weekly_warrior', name: 'Guerrier Hebdomadaire', description: '7 jours consécutifs à 15+ XP', xp: 50, difficulty: 'moyen', unlocked: false },
            { id: 'project_master', name: 'Maître de Projet', description: 'Créer 5 projets différents', xp: 30, difficulty: 'moyen', unlocked: false },
            
            // Premium
            { id: 'focus_master', name: 'Maître du Focus', description: '50 sessions de focus', xp: 100, difficulty: 'premium', unlocked: false },
            { id: 'xp_collector', name: 'Collectionneur XP', description: 'Atteindre 1000 XP total', xp: 150, difficulty: 'premium', unlocked: false },
            { id: 'marathon_runner', name: 'Marathonien', description: '4h de focus en une journée', xp: 200, difficulty: 'premium', unlocked: false },
            
            // Prestigieux
            { id: 'legend', name: 'Légende Vivante', description: '100 sessions de focus', xp: 300, difficulty: 'prestigieux', unlocked: false },
            { id: 'season_champion', name: 'Champion de Saison', description: 'Terminer une saison avec rang S+', xp: 500, difficulty: 'prestigieux', unlocked: false },
            
            // Précieux
            { id: 'transcendent', name: 'Transcendant', description: 'Atteindre le rang SSS', xp: 1000, difficulty: 'précieux', unlocked: false },
            { id: 'eternal', name: 'Éternel', description: '365 jours de streak', xp: 2000, difficulty: 'précieux', unlocked: false }
        ];
        
        this.quests = [
            { id: 'focus_marathon', name: 'Marathon Focus', description: 'Faire 4h de focus en une journée', xp: 20, active: false },
            { id: 'perfect_week', name: 'Semaine Parfaite', description: 'Atteindre 20+ XP pendant 7 jours', xp: 50, active: false },
            { id: 'early_bird', name: 'Lève-tôt', description: 'Commencer une session avant 7h', xp: 15, active: false }
        ];

        this.intensityLevels = [
            { min: 0, max: 20, label: 'Errant du Néant', color: '#666666' },
            { min: 21, max: 40, label: 'Apprenti Perdu', color: '#8b4513' },
            { min: 41, max: 60, label: 'Disciple Motivé', color: '#4169e1' },
            { min: 61, max: 75, label: 'Adepte Déterminé', color: '#32cd32' },
            { min: 76, max: 85, label: 'Expert Focalisé', color: '#ffd700' },
            { min: 86, max: 95, label: 'Maître Discipliné', color: '#ff6347' },
            { min: 96, max: 99, label: 'Légende Vivante', color: '#9932cc' },
            { min: 100, max: 100, label: 'Transcendant', color: '#00ffff' }
        ];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateUI();
        this.checkDailyReset();
        this.loadAchievements();
        this.activateRandomQuests();
        this.updateProjectSelector();
        
        // Initialiser les nouvelles fonctionnalités
        this.initializeDoubleOrNothing();
        this.checkDoubleOrNothingAvailability();
        this.checkDoubleOrNothingChallenge();
        this.updateDailyChallenge();
        this.updateDoubleOrNothingDisplay();
        
        // Mise à jour automatique toutes les secondes
        setInterval(() => {
            if (this.timer.isRunning) {
                this.updateTimer();
            }
            this.updateDailyChallenge();
        }, 1000);
        
        // Sauvegarde automatique toutes les 30 secondes
        setInterval(() => {
            this.saveData();
        }, 30000);
        
        // Vérification du coffre toutes les heures
        setInterval(() => {
            this.checkDoubleOrNothingAvailability();
            this.checkDoubleOrNothingChallenge();
        }, 3600000); // 1 heure
    }
    
    // Gestion des données
    loadData() {
        const defaultData = {
            totalXP: 0,
            dailyXP: 0,
            dailyFocusTime: 0,
            dailyMalus: 0,
            streak: 0,
            lastActiveDate: new Date().toDateString(),
            focusSessions: 0,
            totalFocusTime: 0,
            mandatorySessionsToday: 0,
            bonusSessionsUnlocked: false,
            season: 1,
            week: 1,
            weeklyScores: [],
            intensityRate: 0,
            dailyActivities: {
                sport: false,
                sleep: { logged: false, hours: 0, bedTime: 'after24' },
                distractions: { instagram: 0, music: 0 }
            },
            achievements: {},
            quests: {},
            recentActivity: [],
            settings: {
                autoBreaks: true,
                spotifyIntegration: false,
                notifications: true
            },
            weeklyReviewAvailable: true,
            lastWeeklyReview: null
        };
        
        const saved = localStorage.getItem('myRPGLife3_lunalis_data');
        return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;
    }
    
    saveData() {
        localStorage.setItem('myRPGLife3_lunalis_data', JSON.stringify(this.data));
    }
    
    loadProjects() {
        const defaultProjects = [];
        const saved = localStorage.getItem('myRPGLife3_projects');
        return saved ? JSON.parse(saved) : defaultProjects;
    }
    
    saveProjects() {
        localStorage.setItem('myRPGLife3_projects', JSON.stringify(this.projects));
    }
    
    // Gestion des événements
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.showSection(section);
            });
        });
        
        // Timer controls
        document.getElementById('startPauseBtn').addEventListener('click', () => {
            this.toggleTimer();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetTimer();
        });
        
        // Duration controls
        document.getElementById('decreaseDurationBtn').addEventListener('click', () => {
            this.adjustDuration(-5);
        });
        
        document.getElementById('increaseDurationBtn').addEventListener('click', () => {
            this.adjustDuration(5);
        });
        
        // Focus start button
        document.getElementById('focusStartBtn').addEventListener('click', () => {
            this.showSection('focus');
        });
        
        // Create project button
        document.getElementById('createProjectBtn').addEventListener('click', () => {
            this.showCreateProjectModal();
        });
        
        // Coffre Double ou Rien
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('safe-reward-btn')) {
                this.chooseSafeReward();
            }
            if (e.target.classList.contains('double-or-nothing-btn')) {
                this.chooseDoubleOrNothing();
            }
        });
        
        // Fermeture des modales
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
        });
        
        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.target.matches('input, textarea, select')) {
                e.preventDefault();
                this.toggleTimer();
            }
            if (e.code === 'Escape') {
                this.closeModal();
            }
        });
    }
    
    // Navigation
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
        document.getElementById(sectionName).classList.add('active');
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
        
        // Charger le contenu spécifique
        if (sectionName === 'achievements') {
            this.showAchievements();
        } else if (sectionName === 'progression') {
            this.showProgression();
        } else if (sectionName === 'projects') {
            this.showProjects();
        } else if (sectionName === 'weekly') {
            this.showWeeklyReview();
        } else if (sectionName === 'settings') {
            this.showSettings();
        }
    }
    
    // Système XP et Rangs
    addXP(amount, source = 'Activité') {
        const oldRank = this.getCurrentRank();
        this.data.totalXP += amount;
        this.data.dailyXP += amount;
        
        // Vérifier les achievements
        this.checkAchievements();
        
        // Vérifier changement de rang
        const newRank = this.getCurrentRank();
        if (newRank.badge !== oldRank.badge) {
            this.showRankUpModal(oldRank, newRank);
        }
        
        // Ajouter à l'activité récente
        this.addRecentActivity(`+${amount} XP - ${source}`);
        
        // Notification
        this.showNotification(`+${amount} XP gagné!`, 'success');
        
        this.updateUI();
        this.saveData();
    }
    
    getCurrentRank() {
        for (let i = this.ranks.length - 1; i >= 0; i--) {
            if (this.data.totalXP >= this.ranks[i].minXP) {
                return this.ranks[i];
            }
        }
        return this.ranks[0];
    }
    
    getNextRank() {
        const currentRank = this.getCurrentRank();
        const currentIndex = this.ranks.findIndex(rank => rank.badge === currentRank.badge);
        return currentIndex < this.ranks.length - 1 ? this.ranks[currentIndex + 1] : null;
    }
    
    // Timer Focus
    toggleTimer() {
        if (this.timer.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }
    
    startTimer() {
        if (this.timer.currentTime === 0) {
            this.timer.currentTime = this.timer.totalTime;
        }
        
        // Vérifier si un projet est sélectionné
        const projectSelect = document.getElementById('projectSelect');
        if (projectSelect.value) {
            this.timer.currentProject = projectSelect.value;
        }
        
        this.timer.isRunning = true;
        this.timer.isPaused = false;
        
        // Désactiver les autres fonctionnalités
        this.disableOtherFeatures();
        
        // Simulation Spotify
        if (document.getElementById('spotifyMode').checked) {
            this.showNotification('🎵 Playlist Spotify lancée (simulation)', 'info');
        }
        
        this.timer.interval = setInterval(() => {
            this.updateTimer();
        }, 1000);
        
        this.updateTimerDisplay();
        this.updateTimerControls();
    }
    
    pauseTimer() {
        this.timer.isRunning = false;
        this.timer.isPaused = true;
        clearInterval(this.timer.interval);
        
        this.updateTimerControls();
        this.enableOtherFeatures();
    }
    
    resetTimer() {
        this.timer.isRunning = false;
        this.timer.isPaused = false;
        this.timer.currentTime = this.timer.totalTime;
        clearInterval(this.timer.interval);
        
        this.updateTimerDisplay();
        this.updateTimerControls();
        this.enableOtherFeatures();
    }
    
    updateTimer() {
        if (this.timer.currentTime > 0) {
            this.timer.currentTime--;
            this.updateTimerDisplay();
            this.updateXPPreview();
        } else {
            this.completeTimer();
        }
    }
    
    updateDailyFocusStats() {
        const today = new Date().toDateString();
        
        // Initialiser les stats du jour si nécessaire
        if (!this.data.dailyFocusStats || this.data.dailyFocusStats.date !== today) {
            this.data.dailyFocusStats = {
                date: today,
                sessions: 0,
                totalTime: 0,
                totalXP: 0,
                streak: this.data.dailyFocusStats?.streak || 0
            };
        }
        
        // Mettre à jour l'affichage
        document.getElementById('dailySessions').textContent = this.data.dailyFocusStats.sessions;
        document.getElementById('dailyFocusTime').textContent = `${Math.round(this.data.dailyFocusStats.totalTime)}min`;
        document.getElementById('dailyFocusXP').textContent = this.data.dailyFocusStats.totalXP;
        document.getElementById('streakDays').textContent = this.data.dailyFocusStats.streak;
        
        // Mettre à jour la barre de progression (objectif: 2 sessions)
        const progressPercent = Math.min(100, (this.data.dailyFocusStats.sessions / 2) * 100);
        document.getElementById('dailyProgressFill').style.width = `${progressPercent}%`;
    }

    addDailyFocusStats(minutes, xp) {
        const today = new Date().toDateString();
        
        // Initialiser si nécessaire
        if (!this.data.dailyFocusStats || this.data.dailyFocusStats.date !== today) {
            this.data.dailyFocusStats = {
                date: today,
                sessions: 0,
                totalTime: 0,
                totalXP: 0,
                streak: this.data.dailyFocusStats?.streak || 0
            };
        }
        
        // Ajouter les nouvelles stats
        this.data.dailyFocusStats.sessions++;
        this.data.dailyFocusStats.totalTime += minutes;
        this.data.dailyFocusStats.totalXP += xp;
        
        // Mettre à jour la série si c'est la première session du jour
        if (this.data.dailyFocusStats.sessions === 1) {
            this.data.dailyFocusStats.streak++;
        }
        
        this.updateDailyFocusStats();
        this.saveData();
    }

    completeTimer() {
        this.timer.isRunning = false;
        clearInterval(this.timer.interval);
        
        // Calculer XP gagné
        const minutes = this.timer.totalTime / 60;
        const xpGained = this.calculateFocusXP(minutes);
        
        // Ajouter XP
        this.addXP(xpGained, 'Session Focus');
        
        // Mettre à jour les statistiques
        this.data.focusSessions++;
        this.data.totalFocusTime += minutes;
        this.data.dailyFocusTime = (this.data.dailyFocusTime || 0) + minutes;
        
        // Ajouter aux stats journalières
        this.addDailyFocusStats(minutes, xpGained);
        
        // Mettre à jour les blocs
        this.updateMandatoryBlocks();
        
        // Ajouter temps au projet si sélectionné
        if (this.timer.currentProject) {
            this.addTimeToProject(this.timer.currentProject, minutes);
        }
        
        // Vérifier les pauses automatiques
        if (document.getElementById('autoBreaks').checked && minutes >= 25) {
            this.startBreak();
        } else {
            this.showNotification('🎯 Session terminée! Excellent travail!', 'success');
            this.resetTimer();
            this.enableOtherFeatures();
        }
        
        this.updateUI();
        this.saveData();
    }
    
    calculateFocusXP(minutes) {
        // 18 min = 1 XP (obligatoire) ou 2 XP (bonus)
        const baseXP = minutes / 18;
        const isBonus = this.data.mandatorySessionsToday >= 2;
        return Math.round(baseXP * (isBonus ? 2 : 1));
    }
    
    updateMandatoryBlocks() {
        if (this.data.mandatorySessionsToday < 2) {
            this.data.mandatorySessionsToday++;
            
            if (this.data.mandatorySessionsToday === 2) {
                this.data.bonusSessionsUnlocked = true;
                this.showNotification('🔓 Blocs bonus débloqués! Double XP!', 'success');
            }
        }
        
        this.updateBlocksDisplay();
    }
    
    updateBlocksDisplay() {
        const blocks = ['block1', 'block2', 'block3'];
        
        blocks.forEach((blockId, index) => {
            const block = document.getElementById(blockId);
            if (!block) return;
            
            if (index < this.data.mandatorySessionsToday) {
                block.classList.add('completed');
                block.classList.remove('locked');
            } else if (index === 2 && this.data.bonusSessionsUnlocked) {
                block.classList.remove('locked');
            }
        });
    }
    
    startBreak() {
        this.timer.type = 'break';
        this.timer.currentTime = 5 * 60; // 5 minutes
        this.timer.totalTime = 5 * 60;
        this.timer.isRunning = true;
        
        this.showNotification('☕ Pause de 5 minutes commencée', 'info');
        
        this.timer.interval = setInterval(() => {
            if (this.timer.currentTime > 0) {
                this.timer.currentTime--;
                this.updateTimerDisplay();
            } else {
                this.completeBreak();
            }
        }, 1000);
        
        this.updateTimerDisplay();
    }
    
    completeBreak() {
        this.timer.type = 'focus';
        this.timer.breakCount++;
        this.showNotification('⏰ Pause terminée! Prêt pour une nouvelle session?', 'info');
        this.resetTimer();
        this.enableOtherFeatures();
    }
    
    adjustDuration(minutes) {
        if (!this.timer.isRunning) {
            const newDuration = Math.max(15, Math.min(180, (this.timer.totalTime / 60) + minutes));
            this.timer.totalTime = newDuration * 60;
            this.timer.currentTime = this.timer.totalTime;
            
            document.getElementById('durationDisplay').textContent = `${newDuration} min`;
            this.updateTimerDisplay();
            this.updateXPPreview();
        }
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.timer.currentTime / 60);
        const seconds = this.timer.currentTime % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('timerTime').textContent = timeString;
        
        // Mettre à jour le cercle de progression
        const progress = 1 - (this.timer.currentTime / this.timer.totalTime);
        const circumference = 2 * Math.PI * 90;
        const offset = circumference * (1 - progress);
        
        const progressCircle = document.getElementById('timerProgress');
        if (progressCircle) {
            progressCircle.style.strokeDashoffset = offset;
        }
        
        // Changer la couleur selon l'état
        const timerContainer = document.querySelector('.timer-circle');
        if (this.timer.isRunning && !this.timer.isPaused) {
            timerContainer.classList.add('timer-running');
            timerContainer.classList.remove('timer-paused', 'timer-break');
        } else if (this.timer.isPaused) {
            timerContainer.classList.add('timer-paused');
            timerContainer.classList.remove('timer-running', 'timer-break');
        } else if (this.timer.type === 'break') {
            timerContainer.classList.add('timer-break');
            timerContainer.classList.remove('timer-running', 'timer-paused');
        }
    }
    
    updateXPPreview() {
        const minutes = this.timer.totalTime / 60;
        const xp = this.calculateFocusXP(minutes);
        document.getElementById('timerXPPreview').textContent = `+${xp} XP`;
    }
    
    updateTimerControls() {
        const startPauseBtn = document.getElementById('startPauseBtn');
        const startPauseText = document.getElementById('startPauseText');
        
        if (this.timer.isRunning) {
            startPauseText.textContent = 'Pause';
            startPauseBtn.classList.add('pulse');
        } else {
            startPauseText.textContent = this.timer.isPaused ? 'Reprendre' : 'Démarrer';
            startPauseBtn.classList.remove('pulse');
        }
    }
    
    disableOtherFeatures() {
        // Désactiver la navigation pendant le focus
        document.querySelectorAll('.nav-btn').forEach(btn => {
            if (btn.dataset.section !== 'focus') {
                btn.style.opacity = '0.5';
                btn.style.pointerEvents = 'none';
            }
        });
    }
    
    enableOtherFeatures() {
        // Réactiver la navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
        });
    }
    
    // Actions quotidiennes
    logSport() {
        if (!this.data.dailyActivities.sport) {
            this.data.dailyActivities.sport = true;
            this.addXP(3, 'Sport (50min)');
            
            const btn = document.getElementById('sportBtn');
            btn.classList.add('completed');
            btn.textContent = '✅ Sport effectué';
            btn.onclick = null;
        }
    }
    
    showSleepModal() {
        if (this.data.dailyActivities.sleep.logged) {
            this.showNotification('Sommeil déjà enregistré aujourd\'hui', 'info');
            return;
        }
        
        const modal = document.getElementById('modal');
        modal.innerHTML = `
            <h3>Enregistrer le Sommeil</h3>
            <div class="modal-form">
                <div class="form-group">
                    <label>Heures de sommeil:</label>
                    <input type="number" id="sleepHours" min="1" max="12" value="8">
                </div>
                <div class="form-group">
                    <label>Heure de coucher:</label>
                    <select id="bedTime">
                        <option value="before22">Avant 22h (+2 XP)</option>
                        <option value="before24">Avant minuit (+1 XP)</option>
                        <option value="after24">Après minuit (0 XP)</option>
                    </select>
                </div>
                <div class="modal-buttons">
                    <button class="modal-btn primary" onclick="app.logSleep()">Enregistrer</button>
                    <button class="modal-btn secondary" onclick="app.closeModal()">Annuler</button>
                </div>
            </div>
        `;
        this.showModal();
    }
    
    logSleep() {
        const hours = parseInt(document.getElementById('sleepHours').value);
        const bedTime = document.getElementById('bedTime').value;
        
        this.data.dailyActivities.sleep = {
            logged: true,
            hours: hours,
            bedTime: bedTime
        };
        
        let xp = 0;
        if (hours >= 7) {
            if (bedTime === 'before22') xp = 2;
            else if (bedTime === 'before24') xp = 1;
        }
        
        if (hours < 8) {
            xp -= 1; // Punition pour moins de 8h
        }
        
        if (xp > 0) {
            this.addXP(xp, 'Sommeil');
        } else if (xp < 0) {
            this.addXP(xp, 'Sommeil insuffisant');
        }
        
        const btn = document.getElementById('sleepBtn');
        btn.classList.add('completed');
        btn.textContent = '✅ Sommeil enregistré';
        btn.onclick = null;
        
        this.closeModal();
    }
    
    showDistractionModal() {
        const modal = document.getElementById('modal');
        modal.innerHTML = `
            <h3>Enregistrer les Distractions</h3>
            <div class="modal-form">
                <div class="form-group">
                    <label>Instagram (heures):</label>
                    <input type="number" id="instagramHours" min="0" max="10" step="0.5" value="0">
                    <small>+1h = -3 XP</small>
                </div>
                <div class="form-group">
                    <label>Musique excessive (heures):</label>
                    <input type="number" id="musicHours" min="0" max="10" step="0.5" value="0">
                    <small>+1h30 = -5 XP</small>
                </div>
                <div class="modal-buttons">
                    <button class="modal-btn primary" onclick="app.logDistractions()">Enregistrer</button>
                    <button class="modal-btn secondary" onclick="app.closeModal()">Annuler</button>
                </div>
            </div>
        `;
        this.showModal();
    }
    
    logDistractions() {
        const instagram = parseFloat(document.getElementById('instagramHours').value);
        const music = parseFloat(document.getElementById('musicHours').value);
        
        this.data.dailyActivities.distractions.instagram += instagram;
        this.data.dailyActivities.distractions.music += music;
        
        let totalPenalty = 0;
        if (instagram >= 1) totalPenalty += Math.floor(instagram) * 3;
        if (music >= 1.5) totalPenalty += Math.floor(music / 1.5) * 5;

        if (totalPenalty > 0) {
            this.addXP(-totalPenalty, 'Distractions');
            this.data.dailyMalus = (this.data.dailyMalus || 0) + totalPenalty;
        }
        
        this.closeModal();
    }
    
    // Gestion des projets améliorée
    showProjectForm() {
        const form = document.getElementById('projectForm');
        if (form) {
            form.style.display = 'block';
            document.getElementById('projectName').focus();
        }
    }

    cancelProject() {
        const form = document.getElementById('projectForm');
        if (form) {
            form.style.display = 'none';
            document.getElementById('projectName').value = '';
            document.getElementById('projectDescription').value = '';
            
            // Remettre le bouton en mode création
            const saveBtn = form.querySelector('.btn-project.primary');
            saveBtn.textContent = 'Créer le Projet';
            saveBtn.onclick = () => this.saveProject();
        }
    }

    saveProject() {
        const name = document.getElementById('projectName').value.trim();
        const description = document.getElementById('projectDescription').value.trim();

        if (!name) {
            this.showNotification('Le nom du projet est requis', 'error');
            return;
        }

        const project = {
            id: Date.now().toString(),
            name: name,
            description: description,
            timeSpent: 0,
            sessions: 0,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        };

        this.projects.push(project);
        this.saveProjects();
        this.updateProjectSelector();
        this.showProjects();
        this.cancelProject();
        
        // Vérifier achievement
        if (this.projects.length >= 5) {
            this.unlockAchievement('project_master');
        }
        
        this.showNotification(`Projet "${name}" créé avec succès!`, 'success');
    }

    editProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        const form = document.getElementById('projectForm');
        if (form) {
            form.style.display = 'block';
            document.getElementById('projectName').value = project.name;
            document.getElementById('projectDescription').value = project.description || '';
            
            // Changer le bouton pour la modification
            const saveBtn = form.querySelector('.btn-project.primary');
            saveBtn.textContent = 'Modifier le Projet';
            saveBtn.onclick = () => this.updateProject(projectId);
        }
    }

    updateProject(projectId) {
        const name = document.getElementById('projectName').value.trim();
        const description = document.getElementById('projectDescription').value.trim();

        if (!name) {
            this.showNotification('Le nom du projet est requis', 'error');
            return;
        }

        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            project.name = name;
            project.description = description;
            project.lastActivity = new Date().toISOString();
            
            this.saveProjects();
            this.updateProjectSelector();
            this.showProjects();
            this.cancelProject();
            this.showNotification(`Projet "${name}" modifié avec succès!`, 'success');
        }
    }

    showCreateProjectModal() {
        // Redirection vers la nouvelle méthode
        this.showProjectForm();
    }
    
    createProject() {
        // Redirection vers la nouvelle méthode
        this.saveProject();
    }
    
    addTimeToProject(projectId, minutes) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            project.timeSpent += minutes;
            project.sessions++;
            project.lastActivity = new Date().toISOString();
            this.saveProjects();
        }
    }
    
    updateProjectSelector() {
        const select = document.getElementById('projectSelect');
        if (!select) return;
        
        select.innerHTML = '<option value="">Sélectionner un projet</option>';
        
        this.projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            select.appendChild(option);
        });
    }
    
    showProjects() {
        const container = document.getElementById('projectsGrid');
        if (!container) return;

        if (this.projects.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📂</div>
                    <h3>Aucun projet créé</h3>
                    <p>Créez votre premier projet pour commencer à tracker votre temps de focus!</p>
                    <button class="btn-project primary" onclick="app.showProjectForm()">+ Créer un projet</button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.projects.map(project => {
            const timeSpentHours = Math.floor(project.timeSpent / 60);
            const timeSpentMinutes = project.timeSpent % 60;
            const timeDisplay = timeSpentHours > 0 ? 
                `${timeSpentHours}h ${timeSpentMinutes}min` : 
                `${timeSpentMinutes}min`;

            return `
                <div class="project-item">
                    <div class="project-header">
                        <h3 class="project-title">${project.name}</h3>
                        <div class="project-actions-mini">
                            <button class="btn-mini edit" onclick="app.editProject('${project.id}')" title="Modifier">
                                ✏️
                            </button>
                            <button class="btn-mini delete" onclick="app.deleteProject('${project.id}')" title="Supprimer">
                                🗑️
                            </button>
                        </div>
                    </div>
                    
                    ${project.description ? `<p class="project-description">${project.description}</p>` : ''}
                    
                    <div class="project-stats">
                        <span class="project-stat">⏱️ ${timeDisplay}</span>
                        <span class="project-stat">🎯 ${project.sessions} sessions</span>
                        <span class="project-stat">📅 ${new Date(project.lastActivity).toLocaleDateString()}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    deleteProject(projectId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce projet?')) {
            this.projects = this.projects.filter(p => p.id !== projectId);
            this.saveProjects();
            this.updateProjectSelector();
            this.showProjects();
            this.showNotification('Projet supprimé', 'info');
        }
    }

    // Coffre Double ou Rien
    initializeDoubleOrNothing() {
        if (!this.data.doubleOrNothing) {
            this.data.doubleOrNothing = {
                consecutiveDays: 0,
                isAvailable: false,
                lastCheck: null,
                challengeActive: false,
                challengeDate: null
            };
        }
    }

    checkDoubleOrNothingAvailability() {
        this.initializeDoubleOrNothing();
        
        // Vérifier si l'utilisateur a atteint son quota XP 5 jours d'affilée
        const today = new Date().toDateString();
        
        if (this.data.dailyXP >= 15) {
            if (this.data.doubleOrNothing.lastCheck !== today) {
                this.data.doubleOrNothing.consecutiveDays++;
                this.data.doubleOrNothing.lastCheck = today;
            }
        } else {
            this.data.doubleOrNothing.consecutiveDays = 0;
        }
        
        // Activer le coffre si 5 jours consécutifs
        if (this.data.doubleOrNothing.consecutiveDays >= 5) {
            this.data.doubleOrNothing.isAvailable = true;
        }
        
        this.saveData();
        this.updateDoubleOrNothingDisplay();
    }

    updateDoubleOrNothingDisplay() {
        const chestElement = document.querySelector('.double-or-nothing-chest');
        if (!chestElement) return;

        const statusElement = chestElement.querySelector('.chest-status');
        const choicesElement = chestElement.querySelector('.chest-choices');
        
        if (this.data.doubleOrNothing.isAvailable && !this.data.doubleOrNothing.challengeActive) {
            statusElement.className = 'chest-status available';
            statusElement.textContent = '🔓 Coffre Disponible - Faites votre choix !';
            choicesElement.style.display = 'grid';
        } else if (this.data.doubleOrNothing.challengeActive) {
            statusElement.className = 'chest-status available';
            statusElement.textContent = '⚡ Défi en cours - Terminez votre défi éclair demain !';
            choicesElement.style.display = 'none';
        } else {
            statusElement.className = 'chest-status locked';
            statusElement.textContent = `🔒 Coffre verrouillé - ${this.data.doubleOrNothing.consecutiveDays}/5 jours consécutifs`;
            choicesElement.style.display = 'none';
        }
    }

    chooseSafeReward() {
        if (!this.data.doubleOrNothing.isAvailable) return;
        
        this.addXP(5);
        this.data.doubleOrNothing.isAvailable = false;
        this.data.doubleOrNothing.consecutiveDays = 0;
        this.saveData();
        
        this.showNotification('🎁 +5 XP reçus ! Récompense sûre collectée.', 'success');
        this.updateDoubleOrNothingDisplay();
    }

    chooseDoubleOrNothing() {
        if (!this.data.doubleOrNothing.isAvailable) return;
        
        this.data.doubleOrNothing.isAvailable = false;
        this.data.doubleOrNothing.challengeActive = true;
        this.data.doubleOrNothing.challengeDate = new Date().toDateString();
        this.saveData();
        
        this.showNotification('⚡ Défi accepté ! Terminez 3 blocs de 90min demain sans malus pour +15 XP !', 'warning');
        this.updateDoubleOrNothingDisplay();
    }

    checkDoubleOrNothingChallenge() {
        if (!this.data.doubleOrNothing.challengeActive) return;
        
        const today = new Date().toDateString();
        const challengeDate = this.data.doubleOrNothing.challengeDate;
        const nextDay = new Date(new Date(challengeDate).getTime() + 24 * 60 * 60 * 1000).toDateString();
        
        if (today === nextDay) {
            // Vérifier si le défi est réussi (3 blocs de 90min + aucun malus)
            const todayFocusTime = this.data.dailyFocusTime || 0;
            const todayMalus = this.data.dailyMalus || 0;
            
            if (todayFocusTime >= 270 && todayMalus === 0) { // 3 * 90 = 270 minutes
                this.addXP(15);
                this.showNotification('🏆 Défi réussi ! +15 XP gagnés !', 'success');
            } else {
                this.addXP(-5);
                this.showNotification('💀 Défi échoué... -5 XP perdus.', 'error');
            }
            
            this.data.doubleOrNothing.challengeActive = false;
            this.data.doubleOrNothing.challengeDate = null;
            this.data.doubleOrNothing.consecutiveDays = 0;
            this.saveData();
            this.updateDoubleOrNothingDisplay();
        }
    }

    // Défi journalier
    updateDailyChallenge() {
        const challengeElement = document.querySelector('.daily-challenge');
        if (!challengeElement) return;

        const progressBar = challengeElement.querySelector('.challenge-progress-bar');
        const challengeText = challengeElement.querySelector('.challenge-text');
        
        const progress = Math.min(100, (this.data.dailyXP / 15) * 100);
        progressBar.style.width = `${progress}%`;
        
        if (this.data.dailyXP >= 15) {
            challengeText.textContent = '✅ Défi Journalier Accompli !';
            challengeElement.style.background = 'linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(139, 195, 74, 0.2))';
        } else {
            challengeText.textContent = `🎯 Défi Journalier : ${this.data.dailyXP}/15 XP`;
        }
    }
    
    // Achievements et Quêtes
    checkAchievements() {
        // Premiers pas
        if (this.data.focusSessions >= 1) {
            this.unlockAchievement('first_focus');
        }
        
        // Objectif quotidien
        if (this.data.dailyXP >= 15) {
            this.unlockAchievement('daily_goal');
        }
        
        // Chasseur de focus
        if (this.data.focusSessions >= 10) {
            this.unlockAchievement('focus_hunter');
        }
        
        // Maître du focus
        if (this.data.focusSessions >= 50) {
            this.unlockAchievement('focus_master');
        }
        
        // Collectionneur XP
        if (this.data.totalXP >= 1000) {
            this.unlockAchievement('xp_collector');
        }
        
        // Marathonien (4h en une journée)
        if (this.data.totalFocusTime >= 240) { // Approximation pour la journée
            this.unlockAchievement('marathon_runner');
        }
        
        // Transcendant
        if (this.getCurrentRank().badge === 'SSS') {
            this.unlockAchievement('transcendent');
        }
    }
    
    unlockAchievement(achievementId) {
        if (!this.data.achievements[achievementId]) {
            const achievement = this.achievements.find(a => a.id === achievementId);
            if (achievement) {
                this.data.achievements[achievementId] = true;
                achievement.unlocked = true;
                
                this.addXP(achievement.xp, `Succès: ${achievement.name}`);
                this.showAchievementModal(achievement);
            }
        }
    }
    
    showAchievementModal(achievement) {
        const modal = document.getElementById('modal');
        modal.innerHTML = `
            <div class="achievement-unlock">
                <h3>🏆 Succès Débloqué!</h3>
                <div class="achievement-details">
                    <h4>${achievement.name}</h4>
                    <p>${achievement.description}</p>
                    <div class="achievement-reward">+${achievement.xp} XP</div>
                </div>
                <div class="modal-buttons">
                    <button class="modal-btn primary" onclick="app.closeModal()">Fantastique!</button>
                </div>
            </div>
        `;
        this.showModal();
    }
    
    loadAchievements() {
        this.achievements.forEach(achievement => {
            if (this.data.achievements[achievement.id]) {
                achievement.unlocked = true;
            }
        });
    }
    
    activateRandomQuests() {
        // Activer des quêtes aléatoires si l'utilisateur a 7 jours consécutifs à 15+ XP
        if (this.data.streak >= 7) {
            const inactiveQuests = this.quests.filter(q => !q.active);
            if (inactiveQuests.length > 0 && Math.random() < 0.3) { // 30% de chance
                const randomQuest = inactiveQuests[Math.floor(Math.random() * inactiveQuests.length)];
                randomQuest.active = true;
                this.showNotification(`🎯 Nouvelle quête: ${randomQuest.name}`, 'info');
            }
        }
    }
    
    // Bilan hebdomadaire
    showWeeklyReview() {
        const container = document.getElementById('weeklyContent');
        if (!container) return;
        
        if (!this.data.weeklyReviewAvailable) {
            this.showWeeklyCountdown(container);
            return;
        }
        
        container.innerHTML = `
            <div class="weekly-review">
                <h3>Bilan de la Semaine ${this.data.week}</h3>
                <p>Évaluez votre semaine sur 5 aspects (note sur 10)</p>
                
                <div class="review-form">
                    <div class="review-question">
                        <label>1. Productivité générale:</label>
                        <input type="range" id="q1" min="0" max="10" value="5">
                        <span class="range-value">5</span>
                    </div>
                    <div class="review-question">
                        <label>2. Respect des objectifs:</label>
                        <input type="range" id="q2" min="0" max="10" value="5">
                        <span class="range-value">5</span>
                    </div>
                    <div class="review-question">
                        <label>3. Qualité du sommeil:</label>
                        <input type="range" id="q3" min="0" max="10" value="5">
                        <span class="range-value">5</span>
                    </div>
                    <div class="review-question">
                        <label>4. Activité physique:</label>
                        <input type="range" id="q4" min="0" max="10" value="5">
                        <span class="range-value">5</span>
                    </div>
                    <div class="review-question">
                        <label>5. Bien-être mental:</label>
                        <input type="range" id="q5" min="0" max="10" value="5">
                        <span class="range-value">5</span>
                    </div>
                    
                    <div class="review-total">
                        Score total: <span id="totalScore">25</span>/50
                    </div>
                    
                    <button class="submit-review-btn" onclick="app.submitWeeklyReview()">
                        Valider le Bilan
                    </button>
                </div>
            </div>
        `;
        
        // Ajouter les event listeners pour les sliders
        document.querySelectorAll('.review-question input[type="range"]').forEach(slider => {
            slider.addEventListener('input', this.updateReviewScore.bind(this));
        });
    }
    
    updateReviewScore() {
        const sliders = document.querySelectorAll('.review-question input[type="range"]');
        let total = 0;
        
        sliders.forEach((slider, index) => {
            const value = parseInt(slider.value);
            total += value;
            slider.nextElementSibling.textContent = value;
        });
        
        document.getElementById('totalScore').textContent = total;
    }
    
    showWeeklyCountdown(container) {
        const nextReview = new Date(this.data.lastWeeklyReview);
        nextReview.setDate(nextReview.getDate() + 7);
        
        const now = new Date();
        const timeLeft = nextReview.getTime() - now.getTime();
        
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        container.innerHTML = `
            <div class="weekly-countdown">
                <div class="countdown-title">
                    <h3>🏆 Bilan Hebdomadaire Terminé</h3>
                    <p>Prochain bilan disponible dans :</p>
                </div>
                <div class="countdown-timer">
                    <div class="countdown-unit">
                        <div class="countdown-number">${days}</div>
                        <div class="countdown-label">Jours</div>
                    </div>
                    <div class="countdown-separator">:</div>
                    <div class="countdown-unit">
                        <div class="countdown-number">${hours.toString().padStart(2, '0')}</div>
                        <div class="countdown-label">Heures</div>
                    </div>
                    <div class="countdown-separator">:</div>
                    <div class="countdown-unit">
                        <div class="countdown-number">${minutes.toString().padStart(2, '0')}</div>
                        <div class="countdown-label">Minutes</div>
                    </div>
                    <div class="countdown-separator">:</div>
                    <div class="countdown-unit">
                        <div class="countdown-number">${seconds.toString().padStart(2, '0')}</div>
                        <div class="countdown-label">Secondes</div>
                    </div>
                </div>
                <div class="intensity-display">
                    <div class="intensity-value">${this.data.intensityRate}%</div>
                    <div class="intensity-label">${this.getIntensityLabel()}</div>
                </div>
            </div>
            
            <div class="weekly-info">
                <h4>💡 Pourquoi le Bilan Hebdomadaire ?</h4>
                <p>
                    Le bilan hebdomadaire est un <span class="highlight">moment de réflexion essentiel</span> pour optimiser votre progression. 
                    Il vous permet d'analyser vos performances, d'identifier vos points forts et d'ajuster votre stratégie pour la semaine suivante.
                </p>
                <p>
                    Cette auto-évaluation influence directement votre <span class="highlight">taux d'intensité</span>, qui détermine 
                    la vitesse de votre progression dans le jeu. Plus vous êtes honnête et régulier, plus vous progressez rapidement !
                </p>
                <p>
                    <span class="highlight">Votre dernier taux d'intensité : ${this.data.intensityRate}%</span> - ${this.getIntensityLabel()}
                </p>
            </div>
        `;
        
        // Mettre à jour le compte à rebours chaque seconde
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        this.countdownInterval = setInterval(() => {
            if (document.getElementById('weekly').style.display !== 'none') {
                this.showWeeklyCountdown(container);
            }
        }, 1000);
    }

    submitWeeklyReview() {
        const scores = [];
        document.querySelectorAll('.review-question input[type="range"]').forEach(slider => {
            scores.push(parseInt(slider.value));
        });
        
        const totalScore = scores.reduce((sum, score) => sum + score, 0);
        const percentage = (totalScore / 50) * 100;
        
        this.data.weeklyScores.push({
            week: this.data.week,
            scores: scores,
            total: totalScore,
            percentage: percentage,
            date: new Date().toISOString()
        });
        
        // Calculer le nouveau taux d'intensité
        this.data.intensityRate = this.calculateIntensityRate();
        
        // Récompense XP pour complétion
        this.addXP(10, 'Bilan Hebdomadaire');
        
        // Marquer comme non disponible
        this.data.weeklyReviewAvailable = false;
        this.data.lastWeeklyReview = new Date().toISOString();
        
        // Passer à la semaine suivante
        this.data.week++;
        if (this.data.week > 6) {
            this.data.week = 1;
            this.data.season++;
        }
        
        this.showNotification(`Bilan validé! Taux d'intensité: ${Math.round(percentage)}%`, 'success');
        this.updateUI();
        this.saveData();
        this.showWeeklyReview();
    }
    
    calculateIntensityRate() {
        if (this.data.weeklyScores.length === 0) return 0;
        
        const recentScores = this.data.weeklyScores.slice(-4); // 4 dernières semaines
        const average = recentScores.reduce((sum, score) => sum + score.percentage, 0) / recentScores.length;
        return Math.round(average);
    }
    
    getIntensityLabel() {
        const rate = this.data.intensityRate;
        const level = this.intensityLevels.find(l => rate >= l.min && rate <= l.max);
        return level ? level.label : 'Errant du Néant';
    }
    
    // Affichage des sections
    showAchievements() {
        const container = document.getElementById('achievementsContent');
        if (!container) return;
        
        const groupedAchievements = {
            facile: this.achievements.filter(a => a.difficulty === 'facile'),
            moyen: this.achievements.filter(a => a.difficulty === 'moyen'),
            premium: this.achievements.filter(a => a.difficulty === 'premium'),
            prestigieux: this.achievements.filter(a => a.difficulty === 'prestigieux'),
            précieux: this.achievements.filter(a => a.difficulty === 'précieux')
        };
        
        container.innerHTML = Object.entries(groupedAchievements).map(([difficulty, achievements]) => `
            <div class="achievement-group">
                <h4 class="difficulty-${difficulty}">${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</h4>
                <div class="achievements-list">
                    ${achievements.map(achievement => `
                        <div class="achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}">
                            <div class="achievement-icon">${achievement.unlocked ? '🏆' : '🔒'}</div>
                            <div class="achievement-info">
                                <h5>${achievement.name}</h5>
                                <p>${achievement.description}</p>
                                <span class="achievement-xp">+${achievement.xp} XP</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }
    
    showProgression() {
        const container = document.getElementById('progressionContent');
        if (!container) return;
        
        const currentRank = this.getCurrentRank();
        const nextRank = this.getNextRank();
        
        container.innerHTML = `
            <div class="progression-stats">
                <div class="stat-card">
                    <h4>Saison Actuelle</h4>
                    <p>Saison ${this.data.season}</p>
                    <p>Semaine ${this.data.week}</p>
                    <p>Rang: ${currentRank.name}</p>
                </div>
                <div class="stat-card">
                    <h4>Statistiques Totales</h4>
                    <p>XP Total: ${this.data.totalXP}</p>
                    <p>Sessions: ${this.data.focusSessions}</p>
                    <p>Temps total: ${Math.round(this.data.totalFocusTime)}min</p>
                </div>
                <div class="stat-card">
                    <h4>Performance</h4>
                    <p>Streak: ${this.data.streak} jours</p>
                    <p>Intensité: ${this.data.intensityRate}%</p>
                    <p>Aujourd'hui: ${this.data.dailyXP} XP</p>
                </div>
            </div>
            
            <div class="ranks-overview">
                <h4>Système de Rangs</h4>
                <div class="ranks-list">
                    ${this.ranks.map(rank => `
                        <div class="rank-item ${currentRank.badge === rank.badge ? 'current' : ''}">
                            <div class="rank-badge" style="background: ${rank.color}">${rank.badge}</div>
                            <div class="rank-info">
                                <div class="rank-name">${rank.name}</div>
                                <div class="rank-title">${rank.title}</div>
                                <div class="rank-xp">${rank.minXP} XP</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    showSettings() {
        const container = document.getElementById('settingsContent');
        if (!container) return;
        
        container.innerHTML = `
            <div class="settings-sections">
                <div class="settings-section">
                    <h4>Préférences</h4>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" ${this.data.settings.autoBreaks ? 'checked' : ''} 
                                   onchange="app.updateSetting('autoBreaks', this.checked)">
                            Pauses automatiques
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" ${this.data.settings.notifications ? 'checked' : ''} 
                                   onchange="app.updateSetting('notifications', this.checked)">
                            Notifications
                        </label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h4>Intégrations</h4>
                    <button class="settings-btn integration" onclick="app.connectGoogleCalendar()">
                        📅 Connecter Google Calendar
                    </button>
                    <button class="settings-btn integration" onclick="app.connectSpotify()">
                        🎵 Connecter Spotify
                    </button>
                </div>
                
                <div class="settings-section">
                    <h4>Données</h4>
                    <button class="settings-btn" onclick="app.exportData()">Exporter les données</button>
                    <button class="settings-btn danger" onclick="app.resetData()">Réinitialiser</button>
                </div>
                
                <div class="settings-section">
                    <h4>Informations</h4>
                    <p>MyRPGLife 3 - Lunalis 🌙</p>
                    <p>Version: 3.0.0</p>
                    <p>Données sauvegardées localement</p>
                </div>
            </div>
        `;
    }
    
    connectGoogleCalendar() {
        this.showNotification('🔗 Connexion à Google Calendar (simulation)', 'info');
        // Simulation de connexion
        setTimeout(() => {
            this.showNotification('📅 Google Calendar connecté avec succès!', 'success');
        }, 2000);
    }
    
    connectSpotify() {
        this.showNotification('🔗 Connexion à Spotify (simulation)', 'info');
        // Simulation de connexion
        setTimeout(() => {
            this.showNotification('🎵 Spotify connecté avec succès!', 'success');
        }, 2000);
    }
    
    updateSetting(key, value) {
        this.data.settings[key] = value;
        this.saveData();
        this.showNotification('Paramètre mis à jour', 'info');
    }
    
    exportData() {
        const dataToExport = {
            userData: this.data,
            projects: this.projects,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `myRPGLife_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Données exportées avec succès', 'success');
    }
    
    resetData() {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données? Cette action est irréversible.')) {
            localStorage.removeItem('myRPGLife3_lunalis_data');
            localStorage.removeItem('myRPGLife3_projects');
            location.reload();
        }
    }
    
    // Vérifications quotidiennes
    checkDailyReset() {
        const today = new Date().toDateString();
        if (this.data.lastActiveDate !== today) {
            // Nouveau jour
            if (this.data.dailyXP >= 15) {
                this.data.streak++;
            } else {
                this.data.streak = 0;
            }
            
            // Reset des activités quotidiennes
            this.data.dailyXP = 0;
            this.data.dailyFocusTime = 0;
            this.data.dailyMalus = 0;
            this.data.mandatorySessionsToday = 0;
            this.data.bonusSessionsUnlocked = false;
            this.data.dailyActivities = {
                sport: false,
                sleep: { logged: false, hours: 0, bedTime: 'after24' },
                distractions: { instagram: 0, music: 0 }
            };
            
            this.data.lastActiveDate = today;
            this.saveData();
        }
    }
    
    // Mise à jour de l'interface
    updateUI() {
        this.updateStats();
        this.updateRankDisplay();
        this.updateXPDisplay();
        this.updateIntensityDisplay();
        this.updateSeasonDisplay();
        this.updateBlocksDisplay();
        this.updateActionButtons();
        this.updateDailyFocusStats();
    }
    
    updateStats() {
        // Mettre à jour les statistiques générales
        const elements = {
            'currentXP': this.data.totalXP,
            'dailyXP': this.data.dailyXP,
            'streakDays': this.data.streak,
            'currentSeason': this.data.season,
            'currentWeek': this.data.week,
            'goalProgress': this.data.totalXP
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }
    
    updateRankDisplay() {
        const currentRank = this.getCurrentRank();
        const nextRank = this.getNextRank();
        
        document.getElementById('userAvatar').textContent = currentRank.avatar;
        document.getElementById('rankBadge').textContent = currentRank.badge;
        document.getElementById('rankName').textContent = currentRank.name;
        document.getElementById('rankTitle').textContent = currentRank.title;
        
        if (nextRank) {
            document.getElementById('nextRankXP').textContent = nextRank.minXP;
        }
        
        // Mettre à jour les couleurs
        const rankCard = document.querySelector('.rank-card');
        if (rankCard) {
            rankCard.style.background = `linear-gradient(135deg, ${currentRank.color}, ${currentRank.color}88)`;
        }
    }
    
    updateXPDisplay() {
        const currentRank = this.getCurrentRank();
        const nextRank = this.getNextRank();
        
        if (nextRank) {
            const progress = ((this.data.totalXP - currentRank.minXP) / (nextRank.minXP - currentRank.minXP)) * 100;
            const xpFill = document.getElementById('xpFill');
            if (xpFill) {
                xpFill.style.width = `${Math.min(100, progress)}%`;
            }
        }
    }
    
    updateIntensityDisplay() {
        const rate = this.data.intensityRate;
        const label = this.getIntensityLabel();
        
        document.getElementById('intensityValue').textContent = `${rate}%`;
        document.getElementById('intensityLabel').textContent = label;
        
        const intensityFill = document.getElementById('intensityFill');
        if (intensityFill) {
            intensityFill.style.width = `${rate}%`;
        }
    }
    
    updateSeasonDisplay() {
        const totalWeeks = 6;
        const weeksRemaining = totalWeeks - this.data.week + 1;
        const daysRemaining = 42; // Saison de 42 jours
        
        document.getElementById('daysRemaining').textContent = daysRemaining;
    }
    
    updateActionButtons() {
        // Mettre à jour l'état des boutons d'action
        const sportBtn = document.getElementById('sportBtn');
        const sleepBtn = document.getElementById('sleepBtn');
        const weeklyBtn = document.getElementById('weeklyReviewBtn');
        
        if (this.data.dailyActivities.sport && sportBtn) {
            sportBtn.classList.add('completed');
            sportBtn.textContent = '✅ Sport effectué';
            sportBtn.onclick = null;
        }
        
        if (this.data.dailyActivities.sleep.logged && sleepBtn) {
            sleepBtn.classList.add('completed');
            sleepBtn.textContent = '✅ Sommeil enregistré';
            sleepBtn.onclick = null;
        }
        
        // Mettre à jour le bouton bilan hebdo
        if (weeklyBtn) {
            if (this.data.weeklyReviewAvailable) {
                weeklyBtn.disabled = false;
                weeklyBtn.textContent = '📊 Effectuer le Bilan Hebdomadaire';
            } else {
                weeklyBtn.disabled = true;
                weeklyBtn.textContent = '⏳ Bilan effectué - Prochaine semaine';
            }
        }
    }
    
    // Fonction pour aller au bilan hebdomadaire
    goToWeeklyReview() {
        if (this.data.weeklyReviewAvailable) {
            this.showSection('weekly');
        } else {
            this.showNotification('Bilan hebdomadaire déjà effectué cette semaine', 'info');
        }
    }
    
    // Gestion des modales
    showModal() {
        document.getElementById('modalOverlay').classList.add('active');
    }
    
    closeModal() {
        document.getElementById('modalOverlay').classList.remove('active');
    }
    
    // Notifications
    showNotification(message, type = 'info') {
        if (!this.data.settings.notifications) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.getElementById('notifications').appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
    
    showRankUpModal(oldRank, newRank) {
        const modal = document.getElementById('modal');
        modal.innerHTML = `
            <div class="rank-up-modal">
                <h3>🎉 MONTÉE DE RANG!</h3>
                <div class="rank-transition">
                    <div class="old-rank">
                        <div class="rank-badge" style="background: ${oldRank.color}">${oldRank.badge}</div>
                        <div>${oldRank.name}</div>
                    </div>
                    <div class="arrow">→</div>
                    <div class="new-rank">
                        <div class="rank-badge glow" style="background: ${newRank.color}">${newRank.badge}</div>
                        <div>${newRank.name}</div>
                    </div>
                </div>
                <p class="rank-title">${newRank.title}</p>
                <div class="modal-buttons">
                    <button class="modal-btn primary" onclick="app.closeModal()">Incroyable!</button>
                </div>
            </div>
        `;
        this.showModal();
    }
    
    addRecentActivity(activity) {
        this.data.recentActivity.unshift({
            text: activity,
            timestamp: new Date().toISOString()
        });
        
        // Garder seulement les 10 dernières activités
        this.data.recentActivity = this.data.recentActivity.slice(0, 10);
    }
}

// Initialisation de l'application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MyRPGLife();
    // Rendre l'objet app accessible globalement pour les fonctions onclick restantes
    window.app = app;
});

// Fonction globale pour la compatibilité avec les onclick restants
function initializeApp() {
    if (typeof app !== 'undefined') {
        window.app = app;
    }
}