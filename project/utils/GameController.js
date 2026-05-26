export class GameController {
    constructor(scene) {
        this.scene = scene;
        
        this.INITIAL_HP = 100;
        this.HP_DECAY_RATE = 1; // 1 HP per second
        this.MAX_BALES = 3;
        this.BALE_HEAL_VALUE = 50;

        // UI elements
        this.overlay = document.getElementById('game-over-overlay');
        this.scoreDisplay = document.getElementById('final-score');
        this.restartBtn = document.getElementById('restart-button');

        if (this.restartBtn) {
            this.restartBtn.onclick = () => this.reset();
        }

        // game state
        this.reset();
    }

    /**
     * Resets the game state and hides the overlay
     */
    reset() {
        this.hp = this.INITIAL_HP;
        this.score = 0;
        this.wagonBales = 0;
        this.wagonBaleScales = [];
        this.lastDamage = 0;
        this.lastHeal = 0;
        this.balesDelivered = 0;
        this.isGameOver = false;

        if (this.overlay) {
            this.overlay.style.display = 'none';
        }
    }

    /**
     * Updates game state based on time elapsed
     * @param {number} dt - Time since last update in seconds
     */
    update(dt) {
        if (this.isGameOver) return;

        // update score (= time passed)
        this.score += dt;

        // apply HP Decay
        this.hp -= this.HP_DECAY_RATE * dt;

        // check Game Over
        if (this.hp <= 0) {
            this.hp = 0;
            this.isGameOver = true;
            this.onGameOver();
        }
    }

    /**
     * Handles game over state: shows overlay and final score
     */
    onGameOver() {
        console.log("Game Over! Final Score: " + Math.floor(this.score));
        
        if (this.overlay && this.scoreDisplay) {
            this.scoreDisplay.innerText = Math.floor(this.score);
            this.overlay.style.display = 'flex';
        }
    }

    /**
     * Apply damage to the wagon
     * @param {number} amount - HP to lose
     */
    applyDamage(amount) {
        if (this.isGameOver) return;
        this.hp -= amount;
        this.lastDamage = amount;
        if (this.hp < 0) this.hp = 0;
    }

    /**
     * Deliver hay bales to the barn
     */
    deliverBales() {
        if (this.isGameOver) return;
        if (this.wagonBales > 0) {
            const healing = this.wagonBales * this.BALE_HEAL_VALUE;
            this.hp += healing;
            this.lastHeal = healing;
            this.balesDelivered += this.wagonBales;
            this.wagonBales = 0;
            this.wagonBaleScales = []; // Reset scales on delivery
            
            // Limit HP if needed, e.g., max 200
            if (this.hp > 200) this.hp = 200;
        }
    }

    /**
     * Capture a hay bale
     */
    captureBale(scale = 1.75) {
        if (this.isGameOver) return;
        if (this.wagonBales < this.MAX_BALES) {
            this.wagonBales++;
            this.wagonBaleScales.push(scale); // Store the bale's exact scale
            return true;
        }
        return false;
    }
}
