class SPIFFManager {
    constructor() {
        this.managers = {
            manager1: { name: 'Pierre', metrics: { sqo: false, progression: false, meetings: false, mql: false } },
            manager2: { name: 'Hélie', metrics: { sqo: false, progression: false, meetings: false, mql: false } },
            manager3: { name: 'Simon', metrics: { sqo: false, progression: false, meetings: false, mql: false } },
            manager4: { name: 'Toni', metrics: { sqo: false, progression: false, meetings: false, mql: false } }
        };
        
        this.init();
    }
    
    init() {
        this.loadData();
        this.updateAllDisplays();
        this.updateLeaderboard();
        
        // Auto-save every 30 seconds
        setInterval(() => this.saveData(), 30000);
    }
    
    toggleMetric(managerId, metric) {
        this.managers[managerId].metrics[metric] = !this.managers[managerId].metrics[metric];
        this.updateDisplay(managerId);
        this.updateLeaderboard();
        this.saveData();
        
        // Add some visual feedback
        this.showNotification(`${this.managers[managerId].name} - ${metric.toUpperCase()} ${this.managers[managerId].metrics[metric] ? 'UNLOCKED!' : 'locked'}`);
    }
    
    updateDisplay(managerId) {
        const manager = this.managers[managerId];
        const card = document.getElementById(managerId);
        const pieces = card.querySelectorAll('.puzzle-piece');
        const progressBar = card.querySelector('.progress-fill');
        const scoreDisplay = card.querySelector('.score');
        
        let unlockedCount = 0;
        
        // Update puzzle pieces
        pieces.forEach(piece => {
            const metric = piece.getAttribute('data-metric');
            if (manager.metrics[metric]) {
                piece.classList.add('unlocked');
                unlockedCount++;
            } else {
                piece.classList.remove('unlocked');
            }
        });
        
        // Update progress bar
        const progressPercent = (unlockedCount / 4) * 100;
        progressBar.style.width = `${progressPercent}%`;
        
        // Update score display
        scoreDisplay.textContent = `${unlockedCount}/4 Pieces`;
        
        // Add winner effect if all pieces unlocked
        if (unlockedCount === 4) {
            card.classList.add('winner');
        } else {
            card.classList.remove('winner');
        }
    }
    
    updateAllDisplays() {
        Object.keys(this.managers).forEach(managerId => {
            this.updateDisplay(managerId);
        });
    }
    
    updateLeaderboard() {
        const standings = document.getElementById('standings');
        const managerStats = Object.entries(this.managers).map(([id, manager]) => {
            const completed = Object.values(manager.metrics).filter(Boolean).length;
            return { id, name: manager.name, completed, percentage: (completed / 4) * 100 };
        });
        
        // Sort by completion
        managerStats.sort((a, b) => b.completed - a.completed);
        
        standings.innerHTML = managerStats.map((manager, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏃';
            const winnerClass = manager.completed === 4 ? 'winner' : '';
            
            return `
                <div class="standings-item ${winnerClass}">
                    <span>${medal} ${manager.name}</span>
                    <span>${manager.completed}/4 (${manager.percentage}%)</span>
                </div>
            `;
        }).join('');
    }
    
    showNotification(message) {
        // Simple notification - you could make this fancier
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #00ff41;
            color: black;
            padding: 15px;
            border-radius: 5px;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    saveData() {
        localStorage.setItem('spiff-data', JSON.stringify(this.managers));
    }
    
    loadData() {
        const saved = localStorage.getItem('spiff-data');
        if (saved) {
            const data = JSON.parse(saved);
            // Merge saved data with current structure (in case you add new managers)
            Object.keys(this.managers).forEach(managerId => {
                if (data[managerId]) {
                    this.managers[managerId].metrics = { ...this.managers[managerId].metrics, ...data[managerId].metrics };
                }
            });
        }
    }
}

// Global function for HTML onclick events
function toggleMetric(managerId, metric) {
    window.spiffManager.toggleMetric(managerId, metric);
}

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.spiffManager = new SPIFFManager();
});

// Add some keyboard shortcuts for quick admin
document.addEventListener('keydown', (e) => {
    if (e.altKey) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 4) {
            const managerId = `manager${num}`;
            // Alt+Number unlocks next available metric for that manager
            const manager = window.spiffManager.managers[managerId];
            const metrics = ['sqo', 'progression', 'meetings', 'mql'];
            const nextMetric = metrics.find(metric => !manager.metrics[metric]);
            if (nextMetric) {
                window.spiffManager.toggleMetric(managerId, nextMetric);
            }
        }
    }
});
