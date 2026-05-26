import { MyDepositedHaybalesArea } from "../elements/MyDepositedHaybalesArea.js";

export class GameController {
    constructor(scene) {
        this.scene = scene;

        this.INITIAL_HP = 100;
        this.HP_DECAY_RATE = 1; // 1 HP per second
        this.MAX_BALES = 2;
        this.BALE_HEAL_VALUE = 50;

        // UI elements
        this.overlay = document.getElementById('game-over-overlay');
        this.scoreDisplay = document.getElementById('final-score');
        this.restartBtn = document.getElementById('restart-button');

        if (this.restartBtn) {
            this.restartBtn.onclick = () => {
                window.location.reload();
            };
        }

        // Target area to pile delivered hay bales neatly
        this.depositedArea = new MyDepositedHaybalesArea(scene);

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
        this.wagonBaleScales = []; // Array to store exact scales of carried bales
        this.lastDamage = 0;
        this.lastHeal = 0;
        this.balesDelivered = 0;
        this.isGameOver = false;
        this.keyCooldown = 0; // Input check cooldown

        if (this.overlay) {
            this.overlay.style.display = 'none';
        }
    }

    /**
     * Updates game state based on time elapsed, handles inputs and updates scene models
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
            return;
        }

        // process wagon movement inputs
        this.checkKeys(dt);

        // update wagon physical positions & terrain alignments
        if (this.scene.wagon) {
            this.scene.wagon.update(dt);
        }

        // process key interactions (P and L) with cooldown
        if (this.keyCooldown > 0) {
            this.keyCooldown -= dt;
        }

        const gui = this.scene.gui;
        const isP = this.keyCooldown <= 0 && gui && typeof gui.isKeyPressed === 'function' && gui.isKeyPressed("KeyP");
        const isL = this.keyCooldown <= 0 && gui && typeof gui.isKeyPressed === 'function' && gui.isKeyPressed("KeyL");

        if (isP || isL) {
            this.keyCooldown = 0.3; // 300ms input cooldown
        }

        // check collision with hay bales
        if (this.scene.hayBales && this.scene.wagon) {
            this.scene.hayBales.checkCollisions(this.scene.wagon, this, isP);
        }

        // check drop/delivery action (when L is pressed)
        if (isL && this.scene.hayBales && this.scene.wagon) {
            if (this.scene.deliveryCircle && this.scene.deliveryCircle.isIntersecting(this.scene.wagon)) {
                this.deliverBales();
            } else {
                this.scene.hayBales.dropBale(this.scene.wagon, this);
            }
        }
    }

    /**
     * Checks driving input keys and calls wagon acceleration/steering methods
     * @param {number} dt - Time delta in seconds
     */
    checkKeys(dt) {
        const gui = this.scene.gui;
        const wagon = this.scene.wagon;
        if (!wagon) return;

        if (gui && typeof gui.isKeyPressed === 'function') {
            if (gui.isKeyPressed("KeyW")) {
                wagon.accelerate(dt);
            } else if (gui.isKeyPressed("KeyS")) {
                wagon.brake(dt);
            } else {
                wagon.decelerate(dt);
            }

            if (gui.isKeyPressed("KeyA")) {
                wagon.steer(1, dt);
            } else if (gui.isKeyPressed("KeyD")) {
                wagon.steer(-1, dt);
            } else {
                wagon.steer(0, dt);
            }
        } else {
            wagon.decelerate(dt);
            wagon.steer(0, dt);
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
            // limit HP to 200
            if (this.hp > 200) this.hp = 200;

            this.lastHeal = healing;

            // relocate and release delivered bales in MyHayBales using the new MyDepositedHaybalesArea class
            if (this.scene.hayBales && this.scene.hayBales.hayBales) {
                const capturedBales = this.scene.hayBales.hayBales.filter(b => b.captured);
                this.depositedArea.depositBales(capturedBales, this.balesDelivered);
            }

            this.balesDelivered += this.wagonBales;
            console.log(`Delivered ${this.wagonBales} hay bales! Healed ${healing} HP. Current HP: ${this.hp.toFixed(1)}`);
            
            this.wagonBales = 0;
            this.wagonBaleScales = [];
        }
    }

    /**
     * Drop a carried hay bale
     * @returns {number|null} - The scale of the dropped bale
     */
    dropBale() {
        if (this.isGameOver) return null;
        if (this.wagonBales > 0) {
            this.wagonBales--;
            return this.wagonBaleScales.pop(); // Remove and return the last bale's scale
        }
        return null;
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
