import { MyHaybalePlatform } from "../elements/haybales/MyHaybalePlatform.js";
import { MyHayBale } from "../elements/haybales/MyHayBale.js";

export class GameController {
    // Initializes the game state, loads game over UI overlay references, registers restart handlers, and creates the haybale platform.
    constructor(scene) {
        this.scene = scene;

        this.INITIAL_HP = 200;
        this.HP_DECAY_RATE = 1;
        this.MAX_BALES = 2;
        this.BALE_HEAL_VALUE = 50;

        this.overlay = document.getElementById('game-over-overlay');
        this.scoreDisplay = document.getElementById('final-score');
        this.restartBtn = document.getElementById('restart-button');

        if (this.restartBtn) {
            this.restartBtn.onclick = () => {
                window.location.reload();
            };
        }

        this.haybaleplatform = new MyHaybalePlatform(scene);

        this.reset();
    }

    // Resets game parameters including HP, score, delivered bales counter, game over states, and hides the overlay.
    reset() {
        this.hp = this.INITIAL_HP;
        this.score = 0;
        this.wagonBales = 0;
        this.lastDamage = 0;
        this.lastHeal = 0;
        this.balesDelivered = 0;
        this.isGameOver = false;
        this.keyCooldown = 0;

        if (this.overlay) {
            this.overlay.style.display = 'none';
        }
    }

    // Updates game statistics, ticks down time-based score, reduces player HP, polls active keyboard inputs, updates wagon physics, and evaluates bale collection or platform delivery interactions.
    update(dt) {
        if (this.isGameOver) return;

        this.score += dt;

        this.hp -= this.HP_DECAY_RATE * dt;

        if (this.hp <= 0) {
            this.hp = 0;
            this.isGameOver = true;
            this.onGameOver();
            return;
        }

        this.checkKeys(dt);

        if (this.scene.wagon) {
            this.scene.wagon.update(dt);
        }

        if (this.keyCooldown > 0) {
            this.keyCooldown -= dt;
        }

        const gui = this.scene.gui;
        const isP = this.keyCooldown <= 0 && gui && typeof gui.isKeyPressed === 'function' && gui.isKeyPressed("KeyP");
        const isL = this.keyCooldown <= 0 && gui && typeof gui.isKeyPressed === 'function' && gui.isKeyPressed("KeyL");

        if (isP || isL) {
            this.keyCooldown = 0.3;
        }

        if (this.scene.baleManager && this.scene.wagon) {
            this.scene.baleManager.checkCollisions(this.scene.wagon, this, isP);
        }

        if (isL && this.scene.baleManager && this.scene.wagon) {
            if (this.scene.deliveryCircle && this.scene.deliveryCircle.isIntersecting(this.scene.wagon)) {
                this.deliverBales();
            } else {
                this.scene.baleManager.dropBale(this.scene.wagon, this);
            }
        }
    }

    // Polls interface controls for W/A/S/D key presses and redirects inputs to wagon steering, acceleration, or braking mechanisms.
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

    // Handles transitioning to game over state, logging final statistics, and displaying the overlay with the user's score.
    onGameOver() {
        console.log("Game Over! Final Score: " + Math.floor(this.score));

        if (this.overlay && this.scoreDisplay) {
            this.scoreDisplay.innerText = Math.floor(this.score);
            this.overlay.style.display = 'flex';
        }
    }

    // Inflicts health point damage to the player, updates last damage records, handles death triggers, and invokes a red visual flash on the wagon.
    applyDamage(amount) {
        if (this.isGameOver) return;
        this.hp -= amount;
        this.lastDamage = amount;
        if (this.hp < 0) this.hp = 0;

        if (this.scene.wagon && this.scene.wagon.triggerDamageFlash) {
            this.scene.wagon.triggerDamageFlash();
        }
    }

    // Processes delivery of all collected hay bales to the target circle, restores player HP proportionally, deposits physical bales on the platform, and triggers a green visual flash.
    deliverBales() {
        if (this.isGameOver) return;
        if (this.wagonBales > 0) {
            const healing = this.wagonBales * this.BALE_HEAL_VALUE;
            this.hp += healing;

            if (this.hp > 200) this.hp = 200;

            this.lastHeal = healing;

            if (this.scene.baleManager && this.scene.baleManager.hayBales) {
                const capturedBales = this.scene.baleManager.hayBales.filter(b => b.captured);
                this.haybaleplatform.depositBales(capturedBales, this.balesDelivered);

                if (typeof this.scene.baleManager.respawnBales === 'function') {
                    this.scene.baleManager.respawnBales(capturedBales.length);
                }
            }

            if (this.scene.wagon && this.scene.wagon.triggerHealFlash) {
                this.scene.wagon.triggerHealFlash();
            }

            this.balesDelivered += this.wagonBales;
            console.log(`Delivered ${this.wagonBales} hay bales! Healed ${healing} HP. Current HP: ${this.hp.toFixed(1)}`);

            this.wagonBales = 0;
        }
    }

    // Deducts one hay bale from the wagon inventory and returns its scaling size for physics drop calculations.
    dropBale() {
        if (this.isGameOver) return null;
        if (this.wagonBales > 0) {
            this.wagonBales--;
            return MyHayBale.SCALE;
        }
        return null;
    }

    // Attempts to add a hay bale to the wagon inventory if the player is currently under the carrying limit.
    captureBale() {
        if (this.isGameOver) return false;
        if (this.wagonBales < this.MAX_BALES) {
            this.wagonBales++;
            return true;
        }
        return false;
    }

    // Processes a collision notification from the physics engine, assigning randomized damage for barrier hits and logging water hazard events.
    onWagonCollision(obstacleType) {
        if (obstacleType === 'world_limit') {
            const damage = Math.floor(Math.random() * (15 - 5 + 1)) + 5;
            this.applyDamage(damage);
            return;
        }

        if (obstacleType === 'water') {
            console.log("Wagon hit water! Stay on land.");
            return;
        }

        const damage = Math.floor(Math.random() * (15 - 5 + 1)) + 5;
        this.applyDamage(damage);
    }
}