import { OSC_Controller } from "./synthesizer/oscController.js";
import { getFrequency, getRMS } from "./synthesizer/analyser.js";

window.addEventListener('DOMContentLoaded', () => {
  activateOSC();
});

let isAudioActive = false;
let isClickActive = false;

const controllers = [];
const isOSCPlaying = [];


const maxDistance = 10,
  minDistance = 2;
const minFrequ = 20, maxFrequ = 20000;


function activateOSC() {
  isAudioActive = true;

  // setting up the oscillators
  for (let i = 0; i < 7; i++) {
    const controller = new OSC_Controller();
    controller.setOSCAttack(0.05)
    controller.setOSCRelease(0.1)

    controller.setOSCFrequModGain(50);
    controller.setOSCFreqModFreq(0.2);

    controllers.push(controller);
    isOSCPlaying.push(false);
  }
  controllers[0].setOSCFrequency(261);

  controllers[1].setOSCFrequency(587);
  controllers[1].setOSCWaveform("square");

  controllers[2].setOSCFrequency(659);
  controllers[2].setOSCWaveform("sawtooth");

  controllers[3].setOSCFrequency(698);
  controllers[3].setOSCWaveform("triangle");

  /* controllers[4].setOSCFrequency(784);
  controllers[4].setOSCWaveform("triangle");

  controllers[5].setOSCFrequency(880);

  controllers[6].setOSCFrequency(987);
  controllers[6].setOSCFreqModFreq(15);
  controllers[6].setOSCWaveform("square");
 */



}



/* 
<a-entity>.object3D is a reference to the entity’s three.js Object3D representation. 
https://threejs.org/docs/#api/en/core/Object3D */


const minFreq = 20, maxFreq = 20000;
const toneVisualizerDefaultHeight = 0.5,
  toneVisualizerDefaultWidth = 0.1,
  toneVisualizerDefaultDepth = 0.5;

AFRAME.registerComponent('marker', {

  init: function () {
    // this. = attaches to the component -> available in all functions
    this.markerWorldPosition = new THREE.Vector3(0, 0, 0);
    this.visible = false;
    this.markerRotation;
    this.cameraPosition;
    this.lastXPosition = 0;

    this.index = this.el.getAttribute('index');
    this.currentFreq = controllers[this.index].getOSCFrequency();
    this.toneVisualizer = this.el.querySelector('[tone-visualizer]');
    this.gainText = this.el.querySelector('[gain]');
    this.freqText = this.el.querySelector('[frequency]');
    this.modFreqText = this.el.querySelector('[mod-freq]');

    this.camera = this.el.sceneEl.camera;


    /*     this.gainTextObject3D = this.gainText.object3D;
     */


    // init
    this.toneVisualizer.setAttribute('color', 'green');
    this.toneVisualizer.setAttribute('material', 'opacity', 0.5);

    this.gainText.setAttribute('scale', '0.5 0.5 1');
    this.gainText.setAttribute('position', '0 1 0');
    this.gainText.setAttribute('color', 'lime');


    this.freqText.setAttribute('scale', '0.5 0.5  1');
    this.freqText.setAttribute('position', '0 0 0');
    this.freqText.setAttribute('color', 'lime');

    this.modFreqText.setAttribute('scale', '0.5 0.5 1');
    this.modFreqText.setAttribute('position', '0 -1 0');
    this.modFreqText.setAttribute('color', 'lime');


    this.el.addEventListener('markerFound', (event) => {
      this.visible = this.el.object3D.visible;
      controllers[this.index].playOSC();
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
    /*  this.cameraPosition = this.el.sceneEl.camera.el.object3D.position; */
    this.cameraPosition = this.el.sceneEl.object3D.position;
    this.gainTextObject3D = this.gainText.object3D;
    this.freqTextObject3D = this.freqText.object3D;
    this.modFreqTextObject3D = this.modFreqText.object3D;

  },
  run: function () {
    if (this.visible) {
      // revert to default appearance
      this.toneVisualizer.setAttribute('height', toneVisualizerDefaultHeight);
      this.toneVisualizer.setAttribute('width', toneVisualizerDefaultWidth);
      this.toneVisualizer.setAttribute('depth', toneVisualizerDefaultDepth);


      /*       const x = Math.floor(this.markerWorldPosition.x * 100) / 100,
              y = Math.floor(this.markerWorldPosition.y * 100) / 100,
              z = Math.floor(this.markerWorldPosition.z * 100) / 100,
              position = '' + x + ' ' + y + ' ' + z; */

      ////////////////////////      audio      ////////////////////////

      const rotationDegrees = (THREE.MathUtils.radToDeg(this.markerRotation.y) + 360) % 360;

      // change mod freq according to rotation
      if (rotationDegrees >= 0 && rotationDegrees < 90) {
        controllers[this.index].setOSCFreqModFreq(0.2);
      } else if (rotationDegrees >= 90 && rotationDegrees < 180) {
        controllers[this.index].setOSCFreqModFreq(0.7);
      } else if (rotationDegrees >= 180 && rotationDegrees < 270) {
        controllers[this.index].setOSCFreqModFreq(5.3);
      } else if (rotationDegrees >= 270 && rotationDegrees < 360) {
        controllers[this.index].setOSCFreqModFreq(8);
      }

      // change gain according to distance
      const distance = this.markerWorldPosition.distanceTo(this.cameraPosition);
      let gain;

      // allow gain of 1 within a certain distance to camera
      if (distance <= minDistance) {
        gain = 1;
      } else if (distance >= maxDistance) {
        gain = 0;
      } else {
        gain = 1 - distance / maxDistance;
      }
      controllers[this.index].setOSCGain(gain);

      // change frequency according to x position
      const delta = this.markerWorldPosition.x - this.lastXPosition;
      const newFreq = Math.max(minFrequ, (this.currentFreq + delta * 100)); // TODO maxFrequ
      this.currentFreq = newFreq;
      controllers[this.index].setOSCFrequency(newFreq);

      this.lastXPosition = this.markerWorldPosition.x;

      ////////////////////////      visualizer      ////////////////////////

      // change appearance according to frequency
      let freq = getFrequency();
      const normalizedFreq = (freq - minFreq) / (maxFreq - minFreq) * 100;
      this.toneVisualizer.setAttribute('width', `${toneVisualizerDefaultWidth + normalizedFreq}`);

      // RMS
      const rms = getRMS() / 100;
      const normalizedRMS = Math.min(15, rms);
      this.toneVisualizer.setAttribute('height', `${normalizedRMS}`);

      ////////////////////////      text     ////////////////////////

      this.gainText.setAttribute('value', `gain: ${gain.toFixed(2)}`);
      // align the text towards the camera.
      this.gainTextObject3D.lookAt(this.cameraPosition);

      this.freqText.setAttribute('value', `frequency: ${freq.toFixed(0)}`);
      this.freqTextObject3D.lookAt(this.cameraPosition);

      this.modFreqText.setAttribute('value', `modulation frequency: ${controllers[this.index].getOSCFreqModFreq().toFixed(2)}`);
      this.modFreqTextObject3D.lookAt(this.cameraPosition);


    } else {
      return
    }
    requestAnimationFrame(this.run.bind(this));
  }
});