export class MySun {
  constructor(scene) {
    this.scene = scene;
    this.light = scene.lights[0];
  }

  initLight() {
    this.light.setPosition(-0.3217, 0.9468, -0.0014, 0);
    this.light.setAmbient(0.3, 0.3, 0.3, 1.0);
    this.light.setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.light.setSpecular(1.0, 1.0, 1.0, 1.0);
    this.light.enable();
    this.light.update();
  }

  setEnabled(enabled) {
    if (enabled) {
      this.light.enable();
    } else {
      this.light.disable();
    }
  }

  update() {
    this.light.update();
  }
}
