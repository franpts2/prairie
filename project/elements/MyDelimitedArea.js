export class MyDelimitedArea {
    constructor(scene, x = 20, z = -2, radius = 6) {
        this.scene = scene;
        this.x = x;
        this.z = z;
        this.radius = radius;
        this.isIntersecting = false;
    }

    update(wagon) {
        if (!wagon) return;
        const dx = wagon.x - this.x;
        const dz = wagon.z - this.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        this.isIntersecting = dist < (this.radius + 3.5);
    }
}
