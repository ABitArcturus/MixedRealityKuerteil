import { calculateAverageGain, checkAverageGainOverThreshold, visualize, getFrequency, getLoudness } from "./synthesizer/analyser.js";
import { OSC_Controller } from "./synthesizer/oscController.js";

window.addEventListener('DOMContentLoaded', () => {
  activateOSC();
});


let isAudioActive = false;
let isClickActive = false;

const controllers = [], controllers2 = [];
export const isOSCPlaying = [];

function activateOSC() {
  isAudioActive = true;
  console.log('activateOSC');

  // setting up the oscillators
  for (let i = 0; i < 7; i++) {
    const controller = new OSC_Controller();
    controller.setOSCAttack(0.05)
    controller.setOSCRelease(0.1)

    controller.setOSCFrequModGain(100);
    controller.setOSCFreqModFreq(5.3);

    controllers.push(controller);
    isOSCPlaying.push(false);

    /*    const controller2 = new OSC_Controller();
       controller2.setOSCAttack(0.05)
       controller2.setOSCRelease(0.1)
   
       controller2.setOSCFrequModGain(100);
       controller2.setOSCFreqModFreq(5.3);
   
       controllers2.push(controller); */
  }
  controllers[0].setOSCFrequency(261);

  controllers[1].setOSCFrequency(587);
  controllers[1].setOSCWaveform("triangle");

  controllers[2].setOSCFrequency(659);
  /*   controllers[2].setOSCWaveform("sine");
   */
  controllers[3].setOSCFrequency(698);
  controllers[3].setOSCFreqModFreq(0.7);
  controllers[3].setOSCWaveform("square");
  /*   controllers[3].toggleOSCRingModFreq();
   */
  controllers[4].setOSCFrequency(784);
  controllers[4].setOSCWaveform("triangle");

  controllers[5].setOSCFrequency(880);

  controllers[6].setOSCFrequency(987); // 987
  controllers[6].setOSCFreqModFreq(15);
  controllers[6].setOSCWaveform("square");

  // 2nd oscillator
  /*   controllers2[0].setOSCFrequency(261);
  
    controllers2[1].setOSCFrequency(587);
    controllers2[1].setOSCWaveform("triangle");
  
    controllers2[2].setOSCFrequency(659);
    controllers2[2].setOSCWaveform("sine");
  
    controllers2[3].setOSCFrequency(698);
    controllers[3].setOSCFreqModFreq(0.7);
  
    controllers2[4].setOSCFrequency(784);
    controllers2[4].setOSCWaveform("triangle");
  
    controllers2[5].setOSCFrequency(880);
  
    controllers2[6].setOSCFrequency(987);
    controllers2[6].setOSCFreqModFreq(15);
    controllers2[6].setOSCWaveform("square"); */
}

let beingClicked = false; // for not accidentally triggering mouseup
let isHovering = false;


const aFrameScene = document.querySelector('a-scene');
// for positioning
const totalNumberOfKeys = aFrameScene.querySelectorAll('[tone-key]').length,
  middleKeyNum = Math.round(totalNumberOfKeys / 2),
  numberOfKeysLeft = middleKeyNum - 1;



// position of the middle key - defines the other keys
// global positioning is set here
const posYMiddleKey = 2.5,
  posZMiddleKey = -3,
  rotationMiddleyKey = 0;

const positionXGap = 0.8,
  positionZGap = 0.3;

// position variables for key locations
let positionX,
  // y stays the same for all keys
  positionY = posYMiddleKey,
  positionZ,
  rotationY,
  rotationYGap = 15;
const positionsX = [],
  positionsZ = [],
  rotationsY = [];

// distance to other control buttons
const distanceUp = 0.6, distanceDown = 1;

// saving the xyz coordinates of the keys
for (let i = 0; i < totalNumberOfKeys; i++) {
  // calculating the initial X position of the leftmost key - middle key is located at 0
  positionX = (positionXGap * numberOfKeysLeft) * -1 + positionXGap * i;
  positionsX.push(positionX);

  // z starts closer to cam - gets further until middle - gets closer
  positionZ = posZMiddleKey + positionZGap * Math.abs(numberOfKeysLeft - i);
  positionsZ.push(positionZ);

  rotationY = rotationMiddleyKey + rotationYGap * (numberOfKeysLeft - i);
  rotationsY.push(rotationY);
}

// default box appearance
const boxColorDefault = "#e5dddd",
  boxColorHover = '#e5bbbb',
  boxWidthDefault = 0.4,
  boxHeightDefault = 0.4,
  boxDepthDefault = 0.1;



AFRAME.registerComponent('tone-key', {
  /* schema: {
    oscIndex: { type: 'int' },

    position: { default: '0 2 -3' }
  }, */

  init: function () {
    const el = this.el;
    const normalScale = `${boxWidthDefault} ${boxHeightDefault + 0.2} ${boxDepthDefault}`,
      currentIndex = el.getAttribute('oscIndex');

    let beingClicked = false;
    // init
    el.setAttribute('scale', normalScale);
    el.setAttribute('position', `${positionsX[currentIndex]} ${positionY} ${positionsZ[currentIndex]}`);
    el.setAttribute('rotation', `0 ${rotationsY[currentIndex]} 0`);

    const isPlaying = isOSCPlaying[currentIndex];

    el.addEventListener('mousedown', () => {
      beingClicked = true;
      if (isClickActive) {
/*         this.el.setAttribute('color', boxColorHover);
 */        isOSCPlaying[currentIndex] = true;
        triggerOSC(currentIndex);
      }
    });

    el.addEventListener('mouseup', () => {
      if (beingClicked) {
        if (isClickActive) {
/*           this.el.setAttribute('color', boxColorDefault);
 */          isOSCPlaying[currentIndex] = false;
          triggerOSC(currentIndex, isOSCPlaying[currentIndex]);
        }
        beingClicked = false;
      }
    });

    el.addEventListener('mouseenter', () => {
      isHovering = true;
      el.setAttribute('color', boxColorHover);
      el.setAttribute('animation', {
        property: 'scale',
        to: '0.4 0.6 0.2',
        dur: 50
      });

      if (!isClickActive) {
        isOSCPlaying[currentIndex] = true;
        triggerOSC(currentIndex);
      }
    });

    el.addEventListener('mouseleave', () => {
      isHovering = false;
      el.setAttribute('color', boxColorDefault);
      el.setAttribute('animation', {
        property: 'scale',
        to: normalScale,
        dur: 50
      });

      if (!isClickActive) {
        el.setAttribute('color', boxColorDefault);
        isOSCPlaying[currentIndex] = false;
        triggerOSC(currentIndex, isOSCPlaying[currentIndex]);
      }
    });
  }
});
AFRAME.registerComponent('sinewave-box', {
  init: function () {
    const el = this.el,
      sinewaveBox = el.querySelector('a-box'),
      sinewaveText = el.querySelector('a-text'),

      normalScale = `${boxWidthDefault} ${boxHeightDefault} ${boxDepthDefault}`,
      hoverScale = `${boxWidthDefault} ${boxHeightDefault} ${boxDepthDefault + 0.1}`,
      currentIndex = sinewaveBox.getAttribute('oscIndex'),

      waveforms = ["sine", "square", "sawtooth", "triangle"];

    // setting up the text display
    sinewaveText.setAttribute('scale', '1 1 1');
    sinewaveText.setAttribute('position', '0 0 0.5');
    let currentWaveform = controllers[currentIndex].getOSCWaveform(),
      currentWaveformIndex = waveforms.indexOf(currentWaveform);
    sinewaveText.setAttribute('value', currentWaveform);

    el.setAttribute('scale', normalScale);

    // positioning
    el.setAttribute('position', `${positionsX[currentIndex]} ${positionY + distanceUp} ${positionsZ[currentIndex]}`);
    el.setAttribute('rotation', `0 ${rotationsY[currentIndex]} 0`);

    el.addEventListener('mouseenter', () => {

      isHovering = true;
      sinewaveBox.setAttribute('color', boxColorHover);
      el.setAttribute('animation', {
        property: 'scale',
        to: hoverScale,
        dur: 50
      });

      currentWaveformIndex = (currentWaveformIndex + 1) % waveforms.length;
      controllers[currentIndex].setOSCWaveform(waveforms[currentWaveformIndex]);
      /*       controllers2[currentIndex].setOSCWaveform(waveforms[currentWaveformIndex]);
      */

      sinewaveText.setAttribute('value', waveforms[currentWaveformIndex]);
    });

    el.addEventListener('mouseleave', () => {
      isHovering = false;
      sinewaveBox.setAttribute('color', boxColorDefault);
      el.setAttribute('animation', {
        property: 'scale',
        to: normalScale,
        dur: 50
      });

    });
  }

});


AFRAME.registerComponent('activate-click', {
  init: function () {
    const defaultColor = this.el.getAttribute('material').color;
    this.el.addEventListener('click', () => {
      if (isClickActive) {
        this.el.setAttribute('color', defaultColor);
      } else {
        this.el.setAttribute('color', "#FF0000");
      }
      isClickActive = !isClickActive;
      console.log("isClickActive: ", isClickActive);
    });
    this.el.addEventListener('mouseenter', () => {
      isHovering = true;
    }
    );
    this.el.addEventListener('mouseleave', () => {
      isHovering = false;
    }
    );
  }
});

function triggerOSC(controllerIndex) {
  if (!isAudioActive) {
    return;
  }
  if (isOSCPlaying[controllerIndex]) {
    controllers[controllerIndex].playOSC();
  } else {
    controllers[controllerIndex].stopOSC();
  }
}


let isRunning = false;



const waitingTime = 400;
let counter = 0;

function run() {


  if (isRunning) {
    stop();

    if (counter >= controllers2.length) {
      counter = 0;
    }
    controllers2[counter].playOSC();
    counter++;

    setTimeout(() => {
      run();
    }, waitingTime);
  } else {
    counter = 0;
    stop();
  }
  function stop() {
    for (let i = 0; i < controllers2.length; i++) {
      controllers2[i].stopOSC();
    }
  }
}



const minY = 0.5, maxY = positionY - distanceDown; // lower and upper limit of the slider

let target = null;
/* const cursor = document.getElementById('cursor');

const camera = document.getElementById('camera');

document.addEventListener('mousemove', (event) => {
  
  const cursorPosition = cursor.getAttribute('position');
  let previousYPosition = camera.object3D.position.y;
  console.log(previousYPosition);

}); */

AFRAME.registerComponent('slider-knob', {

  init: function () {
    let dragging = false;

    const knob = this.el,
      currentIndex = knob.getAttribute('oscIndex');

    knob.setAttribute('position', `${positionsX[currentIndex]} ${positionY - distanceDown} ${positionsZ[currentIndex]}`);
    knob.setAttribute('rotation', `0 ${rotationsY[currentIndex]} 0`);
    knob.setAttribute('scale', `${boxWidthDefault} ${boxHeightDefault} ${boxDepthDefault}`);

    knob.addEventListener('mouseenter', () => {
      knob.setAttribute('color', boxColorHover);
    });
    knob.addEventListener('mouseleave', () => {
      knob.setAttribute('color', boxColorDefault);
      dragging = false;
    });

    knob.addEventListener('mousedown', (event) => {
      dragging = true;
    });
    knob.addEventListener('mouseup', () => {
      dragging = false;
    });
    // does not work on mobile
    knob.addEventListener('touchstart', (event) => {
      dragging = true;
      event.preventDefault();
    });
    document.addEventListener('touchend', () => {
      dragging = false;
    });
    window.addEventListener('mousemove', (event) => {

      if (!dragging) return;



      // calculating new position based on mouse movement
      const movementY = event.movementY / 100; // accuracy of movement
      const currentPosition = knob.object3D.position;
      let newYPos = currentPosition.y - movementY;

      // limit the movement of the slider
      newYPos = Math.max(minY, Math.min(newYPos, maxY));

      knob.object3D.position.set(positionsX[currentIndex], newYPos, positionsZ[currentIndex]);

      // calculating the slider value 0-100
      const sliderValue = ((newYPos - minY) / (maxY - minY)) * 100;
      console.log('Slider Value:', Math.round(sliderValue));
      controllers[currentIndex].setOSCFreqModFreq(sliderValue);
    });


    let lastTouchY = null;

    document.addEventListener('touchmove', (event) => {

      if (!dragging) return;

      event.preventDefault();

      console.log(event.touches[0].clientY);

      event.preventDefault();

      const touch = event.touches[0];
      const movementY = touch.clientY - lastTouchY;
      lastTouchY = touch.clientY;

      const currentPosition = knob.object3D.position;
      let newYPos = currentPosition.y - movementY; //accuracy of movement

      // limit the movement of the slider
      newYPos = Math.max(minY, Math.min(newYPos, maxY));

      knob.object3D.position.set(currentPosition.x, newYPos, currentPosition.z);
    }
    );
  },





});
AFRAME.registerComponent('slider-line', {
  init: function () {
    const line = this.el;
    const currentIndex = line.getAttribute('oscIndex');
    const startPosition = `${positionsX[currentIndex]} ${positionY - distanceDown} ${positionsZ[currentIndex]}`,
      endPosition = `${positionsX[currentIndex]} ${positionY - distanceDown - 1} ${positionsZ[currentIndex]}`;

    line.setAttribute('line', `start: ${startPosition}; end: ${endPosition}; color: white`);
  },
});
const mover = document.getElementById("mover");
mover.setAttribute('color', 'lime');
mover.setAttribute('depth', '0.1');
mover.setAttribute('opacity', '0.5');
const moverDefaultHeight = 0.1, moverDefaultWidth = 1;
const minHeight = 0.5, maxHeight = 5;
const minFreq = 20, maxFreq = 20000;

function tick() {
  // revert to default appearance
  mover.setAttribute('height', moverDefaultHeight);
  mover.setAttribute('width', moverDefaultWidth);

  if (isOSCPlaying.includes(true)) {

    let newHeight = calculateAverageGain();


    // newHeight can be undefined (tick = faster than audio processing)
    /*    if (newHeight) {
         const normalized = (newHeight - minHeight) / (maxHeight - minHeight);
         mover.setAttribute('height', normalized);
       } */

    // frequency
    let freq = getFrequency();
    const normalizedFreq = (freq - minFreq) / (maxFreq - minFreq);
    mover.setAttribute('width', `${moverDefaultWidth + normalizedFreq * 100}`);

    const rms = getLoudness();
    const normalizedRMS = Math.min(1, rms / 1000);
    console.log(normalizedRMS);
    mover.setAttribute('height', `${normalizedRMS*100 }`);


  }
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);

