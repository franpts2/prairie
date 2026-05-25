export class GameController {
    constructor(scene) {
        this.scene = scene;
        
        this.INITIAL_HP = 100;
        this.HP_DECAY_RATE = 1; // 1 HP per second
        this.MAX_BALES = 2;
        this.BALE_HEAL_VALUE = 50;

        // game state
        this.hp = this.INITIAL_HP;
        this.score = 0;
        this.wagonBales = 0;
        this.lastDamage = 0;
        this.lastHeal = 0;
        this.balesDelivered = 0;
        
        this.isGameOver = false;
    }

    /**
     * Resets the game state
     */
    reset() {
        this.hp = this.INITIAL_HP;
        this.score = 0;
        this.wagonBales = 0;
        this.lastDamage = 0;
        this.lastHeal = 0;
        this.balesDelivered = 0;
        this.isGameOver = false;
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
     * Handles game over state
     */
    onGameOver() {
        console.log("Game Over! Final Score: " + Math.floor(this.score));
    }

    /**
     * Apply damage to the wagon
     * @param {number} amount - HP to lose
     */
    applyDamage(amount) {
        this.hp -= amount;
        this.lastDamage = amount;
        if (this.hp < 0) this.hp = 0;
    }

    /**
     * Deliver hay bales to the barn
     */
    deliverBales() {
        if (this.wagonBales > 0) {
            const healing = this.wagonBales * this.BALE_HEAL_VALUE;
            this.hp += healing;
            this.lastHeal = healing;
            this.balesDelivered += this.wagonBales;
            this.wagonBales = 0;
            
            // limit HP (max 200)
            if (this.hp > 200) this.hp = 200;
        }
    }

    /**
     * Capture a hay bale
     */
    captureBale() {
        if (this.wagonBales < this.MAX_BALES) {
            this.wagonBales++;
            return true;
        }
        return false;
    }
}
