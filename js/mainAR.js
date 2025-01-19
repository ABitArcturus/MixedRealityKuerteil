import { OSC_Controller } from "./synthesizer/oscController.js";

window.addEventListener('DOMContentLoaded', () => {
  activateOSC();
});

let isAudioActive = false;
let isClickActive = false;

const controllers = [], controllers2 = [];
const isOSCPlaying = [];


const maxDistance = 40;
const minFrequ = 20, maxFrequ = 20000;


function activateOSC() {
  isAudioActive = true;
  console.log('activateOSC');

  // setting up the oscillators
  for (let i = 0; i < 7; i++) {
    const controller = new OSC_Controller();
    controller.setOSCAttack(0.05)
    controller.setOSCRelease(0.1)

    controller.setOSCFrequModGain(50);
    controller.setOSCFreqModFreq(5.3);

    controllers.push(controller);
    isOSCPlaying.push(false);

    const controller2 = new OSC_Controller();
    controller2.setOSCAttack(0.05)
    controller2.setOSCRelease(0.1)

    controller2.setOSCFrequModGain(50);
    controller2.setOSCFreqModFreq(5.3);

    controllers2.push(controller);
  }
  controllers[0].setOSCFrequency(261);

  controllers[1].setOSCFrequency(587);
  controllers[1].setOSCWaveform("triangle");

  controllers[2].setOSCFrequency(659);
  controllers[2].setOSCWaveform("sine");

  controllers[3].setOSCFrequency(698);
  controllers[3].toggleOSCRingModFreq();

  controllers[4].setOSCFrequency(784);
  controllers[4].setOSCWaveform("triangle");

  controllers[5].setOSCFrequency(880);

  controllers[6].setOSCFrequency(987);
  controllers[6].setOSCFreqModFreq(15);
  controllers[6].setOSCWaveform("square");

  // 2nd oscillator
  controllers2[0].setOSCFrequency(261);

  controllers2[1].setOSCFrequency(587);
  controllers2[1].setOSCWaveform("triangle");

  controllers2[2].setOSCFrequency(659);
  controllers2[2].setOSCWaveform("sine");

  controllers2[3].setOSCFrequency(698);
  controllers2[3].toggleOSCRingModFreq();

  controllers2[4].setOSCFrequency(784);
  controllers2[4].setOSCWaveform("triangle");

  controllers2[5].setOSCFrequency(880);

  controllers2[6].setOSCFrequency(987);
  controllers2[6].setOSCFreqModFreq(15);
  controllers2[6].setOSCWaveform("square");


}



/* 
<a-entity>.object3D is a reference to the entity’s three.js Object3D representation. 
https://threejs.org/docs/#api/en/core/Object3D */

AFRAME.registerComponent('marker', {

  init: function () {
    this.markerWorldPosition = new THREE.Vector3(0, 0, 0);
    // this. = attaches to the component -> available in all functions
    this.visible = false;
    this.markerRotation;
    this.cameraPosition;
    this.currentFreq = controllers[0].getOSCFrequency();
    this.lastXPosition = 0;

    this.index = this.el.getAttribute('index');
    console.log(this.index);
    this.waveform = this.el.getAttribute('waveform');
    console.log(this.waveform);

    this.el.addEventListener('markerFound', (event) => {
      this.visible = this.el.object3D.visible;
      controllers[this.index].playOSC();
      console.log('markerFound');
      this.run();
    });
    this.el.addEventListener('markerLost', () => {
      controllers[this.index].stopOSC();
    });
  },

  tick: function () {
    this.visible = this.el.object3D.visible;
    this.markerWorldPosition = this.el.object3D.position;
    this.markerRotation = this.el.object3D.rotation;
    this.cameraPosition = this.el.sceneEl.camera.el.object3D.position;
  },
  run: function () {
    if (this.visible) {

      const x = Math.floor(this.markerWorldPosition.x * 100) / 100,
        y = Math.floor(this.markerWorldPosition.y * 100) / 100,
        z = Math.floor(this.markerWorldPosition.z * 100) / 100,
        position = '' + x + ' ' + y + ' ' + z;

      /*  console.log(position); */
      const rotationDegrees = (THREE.MathUtils.radToDeg(this.markerRotation.y) + 360) % 360;
      let currentSection = null;
      if (rotationDegrees >= 0 && rotationDegrees < 90) {
        controllers[this.index].setOSCWaveform("sine");
      } else if (rotationDegrees >= 90 && rotationDegrees < 180) {
        controllers[this.index].setOSCWaveform("triangle");
      } else if (rotationDegrees >= 180 && rotationDegrees < 270) {
        controllers[this.index].setOSCWaveform("sawtooth");
      } else if (rotationDegrees >= 270 && rotationDegrees < 360) {
        controllers[this.index].setOSCWaveform("square");
      }

      // change volume according to distance
      const distance = this.markerWorldPosition.distanceTo(this.cameraPosition);
      let volume = 1 - distance / maxDistance;
      controllers[this.index].setOSCGain(volume);

      // change frequency according to x position
      const delta = this.markerWorldPosition.x - this.lastXPosition;
      const newFreq = Math.max(minFrequ, (this.currentFreq + delta * 100)); // TODO maxFrequ
      this.currentFreq = newFreq;
      controllers[this.index].setOSCFrequency(newFreq);

      this.lastXPosition = this.markerWorldPosition.x;

    } else {
      return
    }
    setTimeout(this.run.bind(this), 100);
  }
});

/* document.addEventListener('touchstart', () => {
  console.log('Screen tapped!');
  document.appendChild(document.createElement('a-box'));

}); */

/* AFRAME.registerComponent('click-color-change', {
  schema: {
    colorOnClick: { type: 'color', default: '#FF0000' }
  },
  init: function () {
    this.el.addEventListener('click', () => {
      console.log("click-color-change triggered");
      this.el.setAttribute('color', this.data.colorOnClick);
    });
  }
}); */



