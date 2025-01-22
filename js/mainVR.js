import { calculateAverageGain, checkAverageGainOverThreshold, visualize, getFrequency, getLoudness } from "./synthesizer/analyser.js";
import { OSC_Controller } from "./synthesizer/oscController.js";
import { addAFrameElements } from "./addAFrameElements.js";

window.addEventListener('DOMContentLoaded', () => {
  addAFrameElements();
  activateOSC();
});
const test = document.querySelector('#test');

// html help button
document.getElementById('help-button').addEventListener('click', function () {
  const overlay = document.getElementById('overlay');
  if (overlay.style.display === 'block') {
    overlay.style.display = 'none';
  } else {
    overlay.style.display = 'block';
  }
});

// aframe back button
AFRAME.registerComponent('aframe-back-button', {

  init: function () {

    const el = this.el,
      normalScale = `0.3 0.3 0.3`,
      hoverScale = `0.4 0.4 0.4`;

    // init
    el.setAttribute('scale', normalScale);
    el.setAttribute('side', 'double');

    el.addEventListener('click', function () {
      window.location.href = 'index.html';
    });

    // hover effect & logic if hovering controls buttons
    el.addEventListener('mouseenter', function () {
      el.setAttribute('scale', hoverScale);
      if (isHoveringControl) {
        window.location.href = 'index.html';
      }
    });
    el.addEventListener('mouseleave', function () {
      el.setAttribute('scale', normalScale);
    });
  }
});

let isHelpActive = false

// aframe help button
AFRAME.registerComponent('aframe-help-button', {
  init: function () {

    const el = this.el,
      questionMark = el.querySelector('a-text'),
      button = el.querySelector('a-plane'),
      normalScale = `0.3 0.3 0.3`,
      hoverScale = `0.4 0.4 0.4`;

    // init
    el.setAttribute('scale', normalScale);
    questionMark.setAttribute('scale', `4 4 4`);
    questionMark.setAttribute('side', 'double');

    // toggle visiibility
    button.addEventListener('click', function () {
      if (isHoveringControl) return;
      performClick();
    });

    // hover effect
    button.addEventListener('mouseenter', function () {
      el.setAttribute('scale', hoverScale);
      if (isHoveringControl) {
        performClick();
      }
    });
    button.addEventListener('mouseleave', function () {
      el.setAttribute('scale', normalScale);
    });

    function performClick() {
      if (overlay.style.display === 'block') {
        overlay.style.display = 'none';
        isHelpActive = false
      } else {
        overlay.style.display = 'block';
        isHelpActive = true
      }
    }
  }
});

// for removing help overlay TODO
window.addEventListener('click', () => {
  if (isHelpActive) {
    console.log('window clicked')
    /*  overlay.style.display = 'none'; */
  }
})
// TODO change freuq for better distinction
// list of available frequencies
const frequencies = [
  261, 293, 329, 349, 392, 440, 493,  // 1st octave
  523, 587, 659, 698, 784, 880, 987,  // 2nd octave ...
  1046, 1175, 1319, 1397, 1568, 1760, 1975,
  2093, 2349, 2637, 2794, 3136, 3520, 3951
];
// mod = 0.2, 5.3, 0.7, 8, 10, 15
const frequenciesModulation = [0.2, 0.7, 5.3, 8, 10, 15];

let isAudioActive = false;
let isHoveringControl = false;

const controllers = [], controllers2 = [];
export const isOSCPlaying = [];

function activateOSC() {
  isAudioActive = true;

  // setting up the oscillators - saving them in an array
  for (let i = 0; i < 7; i++) {
    const controller = new OSC_Controller();
    controller.setOSCAttack(0.05)
    controller.setOSCRelease(0.1)

    controller.setOSCFrequModGain(100);

    controllers.push(controller);
    isOSCPlaying.push(false);

    /*    const controller2 = new OSC_Controller();
       controller2.setOSCAttack(0.05)
       controller2.setOSCRelease(0.1)
   
       controller2.setOSCFrequModGain(100);
       controller2.setOSCFreqModFreq(5.3);
   
       controllers2.push(controller); */
  }
  controllers[0].setOSCFrequency(frequencies[0]);
  controllers[0].setOSCFreqModFreq(frequenciesModulation[0]);

  controllers[1].setOSCFrequency(frequencies[8]);
  controllers[1].setOSCFreqModFreq(frequenciesModulation[1]);
  controllers[1].setOSCWaveform("triangle");

  controllers[2].setOSCFrequency(frequencies[9]);
  controllers[2].setOSCFreqModFreq(frequenciesModulation[2]);
  /*   controllers[2].setOSCWaveform("sine");
   */
  controllers[3].setOSCFrequency(frequencies[10]);
  controllers[3].setOSCFreqModFreq(frequenciesModulation[3]);
  controllers[3].setOSCWaveform("square");
  /*   controllers[3].toggleOSCRingModFreq();
   */
  controllers[4].setOSCFrequency(frequencies[11]);
  controllers[4].setOSCWaveform("triangle");
  controllers[4].setOSCFreqModFreq(frequenciesModulation[4]);

  controllers[5].setOSCFrequency(frequencies[12]);
  controllers[5].setOSCFreqModFreq(frequenciesModulation[5]);

  controllers[6].setOSCFrequency(frequencies[13]); // 987
  /* controllers[6].setOSCFreqModFreq(1000); */
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
export const totalNumberOfKeys = aFrameScene.querySelectorAll('[tone-key]').length,
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
  positionY = posYMiddleKey,
  positionZ,
  rotationY,
  rotationYGap = 15;
const positionsX = [],
  positionsZ = [],
  rotationsY = [];

// distance to other control buttons
const distanceUp = 0.6, distanceDown = 0.5;

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

// TODO rename them better
// default box appearance
const boxColorDefault = "#e5dddd",
  buttonColorHover = '#46ff33',
  boxWidthDefault = 0.4,
  boxHeightDefault = 0.4,
  boxDepthDefault = 0.1,
  toneKeyHeightDefault = boxHeightDefault + 0.2,
  buttonColorActive = 'lime';



AFRAME.registerComponent('tone-key', {
  init: function () {
    const el = this.el;
    const normalScale = `${boxWidthDefault} ${toneKeyHeightDefault} ${boxDepthDefault}`,
      hoverScale = `${boxWidthDefault + 0.05} ${boxHeightDefault + 0.25} ${boxDepthDefault + 0.1}`,
      currentIndex = el.getAttribute('oscIndex');

    let beingClicked = false;
    // init
    el.setAttribute('scale', normalScale);
    el.setAttribute('position', `${positionsX[currentIndex]} ${positionY} ${positionsZ[currentIndex]}`);
    el.setAttribute('rotation', `0 ${rotationsY[currentIndex]} 0`);




    el.addEventListener('mouseenter', () => {
      isHovering = true;
      el.setAttribute('color', buttonColorHover);
      el.setAttribute('animation', {
        property: 'scale',
        to: hoverScale,
        dur: 50
      });
      isOSCPlaying[currentIndex] = true;
      triggerOSC(currentIndex);

    });

    el.addEventListener('mouseleave', () => {
      isHovering = false;
      el.setAttribute('color', boxColorDefault);
      el.setAttribute('animation', {
        property: 'scale',
        to: normalScale,
        dur: 50
      });


      isOSCPlaying[currentIndex] = false;
      triggerOSC(currentIndex, isOSCPlaying[currentIndex]);

    });
  }
});

// available waveforms
const waveforms = ["sine", "square", "sawtooth", "triangle"];


// sinewave box - buttons to set the waveform
AFRAME.registerComponent('sinewave-box', {
  init: function () {
    const sinewaveBox = this.el,
      /* sineBox = el.querySelector('.clickable[increase-mod-freq]'), */
      sineButton = sinewaveBox.querySelector('[sine]'),
      sineText = sinewaveBox.querySelector('a-text[value="sine"]'),
      squareButton = sinewaveBox.querySelector('[square]'),
      squareText = sinewaveBox.querySelector('a-text[value="square"]'),
      sawtoothButton = sinewaveBox.querySelector('[sawtooth]'),
      sawtoothText = sinewaveBox.querySelector('a-text[value="sawtooth"]'),
      triangleButton = sinewaveBox.querySelector('[triangle]'),
      triangleText = sinewaveBox.querySelector('a-text[value="triangle"]'),

      normalBoxScale = `${boxWidthDefault} ${boxHeightDefault / 2} ${boxDepthDefault}`, // 0.2
      hoverBoxScale = `${boxWidthDefault} ${boxHeightDefault / 2} ${boxDepthDefault + 0.1}`,
      normalTextScale = '0.4 0.4 0.4',
      currentIndex = sinewaveBox.getAttribute('oscIndex');
    let currentWaveform = controllers[currentIndex].getOSCWaveform();

    // position parent box
    sinewaveBox.setAttribute('position', `${positionsX[currentIndex]} ${positionY + boxHeightDefault * 3} ${positionsZ[currentIndex]}`);
    sinewaveBox.setAttribute('rotation', `0 ${rotationsY[currentIndex]} 0`);

    // scale texts
    sineText.setAttribute('scale', normalTextScale);
    squareText.setAttribute('scale', normalTextScale);
    sawtoothText.setAttribute('scale', normalTextScale);
    triangleText.setAttribute('scale', normalTextScale);

    // TODO maybe later: putting text closer to box
    // position texts
    sineText.setAttribute('position', `0 0 0.1`);
    squareText.setAttribute('position', `0 -0.22 0.1`);
    sawtoothText.setAttribute('position', `0 -0.44 0.1`);
    triangleText.setAttribute('position', `0 -0.66 0.1`);

    // scale boxes
    sineButton.setAttribute('scale', normalBoxScale);
    squareButton.setAttribute('scale', normalBoxScale);
    sawtoothButton.setAttribute('scale', normalBoxScale);
    triangleButton.setAttribute('scale', normalBoxScale);

    // position boxes
    sineButton.setAttribute('position', '0 0 0');
    squareButton.setAttribute('position', '0 -0.22 0');
    sawtoothButton.setAttribute('position', '0 -0.44 0');
    triangleButton.setAttribute('position', '0 -0.66 0');

    // hovering effect & logic if hovering controls buttons
    sineButton.addEventListener('mouseenter', () => {
      doHover(sineButton);
      if (isHoveringControl) {
        performClick('sine');
      }
    });
    sineButton.addEventListener('mouseleave', () => {
      if (isHoveringControl) return;
      doUnhover(sineButton);
    });
    squareButton.addEventListener('mouseenter', () => {
      doHover(squareButton);
      if (isHoveringControl) {
        performClick('square');
      }
    });
    squareButton.addEventListener('mouseleave', () => {
      if (isHoveringControl) return;
      doUnhover(squareButton);
    });
    sawtoothButton.addEventListener('mouseenter', () => {
      doHover(sawtoothButton);
      if (isHoveringControl) {
        performClick('sawtooth');
      }
    });
    sawtoothButton.addEventListener('mouseleave', () => {
      if (isHoveringControl) return;
      doUnhover(sawtoothButton);
    });
    triangleButton.addEventListener('mouseenter', () => {
      doHover(triangleButton);
      if (isHoveringControl) {
        performClick('triangle');
      }
    });
    triangleButton.addEventListener('mouseleave', () => {
      if (isHoveringControl) return;
      doUnhover(triangleButton);
    });
    function doHover(elementToHover) {
      elementToHover.setAttribute('color', buttonColorHover);
      elementToHover.setAttribute('animation', {
        property: 'scale',
        to: hoverBoxScale,
        dur: 50
      });
    }
    function doUnhover(elementToUnhover) {
      elementToUnhover.setAttribute('color', boxColorDefault);
      elementToUnhover.setAttribute('animation', {
        property: 'scale',
        to: normalBoxScale,
        dur: 50
      });
      colorActiveWaveform();
    }
    // click action
    sineButton.addEventListener('click', () => {
      if (isHoveringControl) return;
      performClick('sine');
    });
    squareButton.addEventListener('click', () => {
      performClick('square');
      /* controllers[currentIndex].setOSCWaveform('square');
      colorActiveWaveform(); */
    });
    sawtoothButton.addEventListener('click', () => {
      performClick('sawtooth');
      /*   controllers[currentIndex].setOSCWaveform('sawtooth');
        colorActiveWaveform(); */
    });
    triangleButton.addEventListener('click', () => {
      performClick('triangle');
      /*       controllers[currentIndex].setOSCWaveform('triangle');
            colorActiveWaveform(); */
    });
    function colorActiveWaveform() {
      sineButton.setAttribute('color', boxColorDefault);
      squareButton.setAttribute('color', boxColorDefault);
      sawtoothButton.setAttribute('color', boxColorDefault);
      triangleButton.setAttribute('color', boxColorDefault);

      currentWaveform = controllers[currentIndex].getOSCWaveform();
      const ele = sinewaveBox.querySelector(`[${currentWaveform}]`);

      ele.setAttribute('color', buttonColorActive);
    }
    function performClick(waveformToSet) {
      controllers[currentIndex].setOSCWaveform(waveformToSet);
      colorActiveWaveform();
    }
    colorActiveWaveform();

  },
});

/**
 * Enables to control all the buttons by hovering. 
 */
AFRAME.registerComponent('enable-hover-control', {
  init: function () {
    const box = this.el,
      button = box.querySelector('a-box'),
      textTop = box.querySelector('a-text[value="hover control"]'),
      textBottom = box.querySelector('a-text[value="inactive"]'),
      normalBoxScale = `0.8 ${boxHeightDefault} ${boxDepthDefault}`,
      hoverBoxScale = `0.9 ${boxHeightDefault + 0.1} ${boxDepthDefault}`,
      normalTextScale = `0.6 0.6 0.6`,
      hoverTextScale = `0.7 0.7 0.7`;

    // position left of the sinewave buttons
    box.setAttribute('position', `${positionsX[0] - 1.5} ${positionY + toneKeyHeightDefault} ${positionsZ[0] + positionZGap * 2}`);
    box.setAttribute('rotation', `0 ${rotationsY[0]} 0`);

    button.setAttribute('scale', normalBoxScale);
    textTop.setAttribute('scale', normalTextScale);
    textBottom.setAttribute('scale', normalTextScale);

    textTop.setAttribute('position', `0 0.1 0.05`);
    textBottom.setAttribute('position', `0 -0.1 0.05`);

    // hover effect & enable hover control
    button.addEventListener('mouseenter', () => {
      button.setAttribute('color', buttonColorHover);
      button.setAttribute('animation', {
        property: 'scale',
        to: hoverBoxScale,
        dur: 50
      });
      textTop.setAttribute('animation', {
        property: 'scale',
        to: hoverTextScale,
        dur: 50
      });
      textBottom.setAttribute('animation', {
        property: 'scale',
        to: hoverTextScale,
        dur: 50
      });

      if (isHoveringControl) {
        isHoveringControl = false;
        button.setAttribute('color', boxColorDefault);
        textBottom.setAttribute('value', "inactive");
      } else {
        isHoveringControl = true;
        button.setAttribute('color', "red");
        textBottom.setAttribute('value', "active");
      }

    });
    button.addEventListener('mouseleave', () => {
      if (!isHoveringControl) {
        button.setAttribute('color', boxColorDefault);
      }
      button.setAttribute('animation', {
        property: 'scale',
        to: normalBoxScale,
        dur: 50
      });
      textTop.setAttribute('animation', {
        property: 'scale',
        to: normalTextScale,
        dur: 50
      });
      textBottom.setAttribute('animation', {
        property: 'scale',
        to: normalTextScale,
        dur: 50
      });
    });
  }
});

/**
 * Toggles the playing of the oscillator.
 * 
 * @param {*} controllerIndex Which oscillator to toggle.
 * @returns 
 */
function triggerOSC(controllerIndex) {
  if (!isAudioActive) {
    return;
  }
  if (isOSCPlaying[controllerIndex]) {
    controllers[controllerIndex].playOSC();
    console.log(controllers[controllerIndex].getOSCFreqModFreq());
  } else {
    controllers[controllerIndex].stopOSC();
  }
}


let isRunning = false;



const waitingTime = 400; // 
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



AFRAME.registerComponent('slider-knob', {

  init: function () {
    let dragging = false;

    const knob = this.el,
      currentIndex = knob.getAttribute('oscIndex');

    knob.setAttribute('position', `${positionsX[currentIndex]} ${positionY - distanceDown} ${positionsZ[currentIndex]}`);
    knob.setAttribute('rotation', `0 ${rotationsY[currentIndex]} 0`);
    knob.setAttribute('scale', `${boxWidthDefault} ${boxHeightDefault} ${boxDepthDefault}`);

    knob.addEventListener('mouseenter', () => {
      knob.setAttribute('color', buttonColorHover);
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
mover.setAttribute('color', buttonColorActive);
mover.setAttribute('depth', '0.1');
mover.setAttribute('opacity', '0.5');
const moverDefaultHeight = 0, moverDefaultWidth = 1;
const minHeight = 0.5, maxHeight = 5;
const minFreq = 20, maxFreq = 20000;

function tick() {
  // revert to default appearance
  mover.setAttribute('height', moverDefaultHeight);
  mover.setAttribute('width', moverDefaultWidth);
  test.setAttribute('visible', false);


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
    mover.setAttribute('height', `${normalizedRMS * 100}`);

    test.setAttribute('visible', true);
    test.setAttribute('light', `type: point; intensity: ${normalizedFreq*10}; distance: 10; decay: 2`);



  }
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);

const smallerBoxWidthDefault = boxWidthDefault / 2 - 0.05, // gab between the two boxes
  hoverScaleModFreq = boxWidthDefault;


AFRAME.registerComponent('freq-mod-box', {
  init: function () {
    const el = this.el,
      increaseText = el.querySelector('a-text[value="+"]'),
      increaseBox = el.querySelector('.clickable[increase-mod-freq]'),
      decreaseText = el.querySelector('a-text[value="-"]'),
      decreaseBox = el.querySelector('.clickable[decrease-mod-freq]'),
      normalScale = `${smallerBoxWidthDefault} ${boxHeightDefault} ${boxDepthDefault}`,
      hoverScale = `${smallerBoxWidthDefault} ${boxHeightDefault} ${boxDepthDefault + 0.1}`,
      currentIndex = el.getAttribute('oscIndex');

    el.setAttribute('position', `${positionsX[currentIndex] + 0.1} ${positionY - distanceDown - boxHeightDefault} ${positionsZ[currentIndex]}`);
    el.setAttribute('rotation', `0 ${rotationsY[currentIndex]} 0`);


    increaseBox.setAttribute('position', `-0.2 0 0`);
    increaseBox.setAttribute('scale', normalScale);

    decreaseBox.setAttribute('position', `0 0 0`);
    decreaseBox.setAttribute('scale', normalScale);

    increaseBox.addEventListener('mouseenter', () => {
      isHovering = true;
      increaseBox.setAttribute('color', buttonColorHover);
      increaseBox.setAttribute('animation', {
        property: 'scale',
        to: hoverScale,
        dur: 50
      });
      controllers[currentIndex].setOSCFreqModFreq(controllers[currentIndex].getOSCFreqModFreq() + 10);
    });

    increaseBox.addEventListener('mouseleave', () => {
      isHovering = false;
      increaseBox.setAttribute('color', boxColorDefault);
      increaseBox.setAttribute('animation', {
        property: 'scale',
        to: normalScale,
        dur: 50
      });
    });

  }
});



// TODO limit freq mod
AFRAME.registerComponent('de', {


  init: function () {

    const el = this.el,
      normalScale = `${smallerBoxWidthDefault} ${boxHeightDefault} ${boxDepthDefault}`,
      hoverScale = `${smallerBoxWidthDefault} ${boxHeightDefault} ${boxDepthDefault + 0.1}`,
      currentIndex = el.getAttribute('oscIndex');


    el.setAttribute('position', `0 0 0`);
/*     el.setAttribute('position', `${positionsX[currentIndex] + 0.1} ${positionY - distanceDown - boxHeightDefault} ${positionsZ[currentIndex]}`);
 *//*     el.setAttribute('rotation', `0 ${rotationsY[currentIndex]} 0`);
 */    el.setAttribute('scale', normalScale);

    el.addEventListener('mouseenter', () => {
      isHovering = true;
      el.setAttribute('color', buttonColorHover);
      el.setAttribute('animation', {
        property: 'scale',
        to: hoverScale,
        dur: 50
      });
      controllers[currentIndex].setOSCFreqModFreq(controllers[currentIndex].getOSCFreqModFreq() - 10);


      console.log(controllers[currentIndex].getOSCFreqModFreq());
    });

    el.addEventListener('mouseleave', () => {
      isHovering = false;
      el.setAttribute('color', boxColorDefault);
      el.setAttribute('animation', {
        property: 'scale',
        to: normalScale,
        dur: 50
      });
    });
  }
});

/**
 * 
 */
AFRAME.registerComponent('increase-tone', {


  init: function () {

    const el = this.el,
      normalScale = `${smallerBoxWidthDefault} ${boxHeightDefault} ${boxDepthDefault}`,
      hoverScale = `${smallerBoxWidthDefault} ${boxHeightDefault} ${boxDepthDefault + 0.1}`,
      currentIndex = el.getAttribute('oscIndex');

    let beingClicked = false;


    el.setAttribute('position', `-0.2 0 0`);
/*     el.setAttribute('rotation', `0 ${rotationsY[currentIndex]} 0`);
 */    el.setAttribute('scale', normalScale);

    el.addEventListener('mouseenter', () => {
      isHovering = true;
      el.setAttribute('color', buttonColorHoverver);
      el.setAttribute('animation', {
        property: 'scale',
        to: hoverScale,
        dur: 50
      });




      let currentfreq = controllers[currentIndex].getOSCFrequency(),
        currentfreqIndex = frequencies.indexOf(currentfreq);

      currentfreqIndex = (currentfreqIndex + 1) % frequencies.length;
      controllers[currentIndex].setOSCFrequency(frequencies[currentfreqIndex]);


    });

    el.addEventListener('mouseleave', () => {
      isHovering = false;
      el.setAttribute('color', boxColorDefault);
      el.setAttribute('animation', {
        property: 'scale',
        to: normalScale,
        dur: 50
      });
    });
  }

});

AFRAME.registerComponent('decrease-tone', {


  init: function () {

    const el = this.el,
      normalScale = `${smallerBoxWidthDefault} ${boxHeightDefault} ${boxDepthDefault}`,
      hoverScale = `${smallerBoxWidthDefault} ${boxHeightDefault} ${boxDepthDefault + 0.1}`,
      currentIndex = el.getAttribute('oscIndex');

    let beingClicked = false;


    el.setAttribute('position', `0 0 0`);
/*     el.setAttribute('rotation', `0 ${rotationsY[currentIndex]} 0`);
 */    el.setAttribute('scale', normalScale);

    el.addEventListener('mouseenter', () => {
      isHovering = true;
      el.setAttribute('color', buttonColorHoverver);
      el.setAttribute('animation', {
        property: 'scale',
        to: hoverScale,
        dur: 50
      });




      let currentfreq = controllers[currentIndex].getOSCFrequency(),
        currentfreqIndex = frequencies.indexOf(currentfreq);

      currentfreqIndex = (currentfreqIndex - 1) % frequencies.length;
      controllers[currentIndex].setOSCFrequency(frequencies[currentfreqIndex]);


    });

    el.addEventListener('mouseleave', () => {
      isHovering = false;
      el.setAttribute('color', boxColorDefault);
      el.setAttribute('animation', {
        property: 'scale',
        to: normalScale,
        dur: 50
      });
    });
  }
});

/**
 * 
 */
AFRAME.registerComponent('freq-adjust', {

  init: function () {
    const freqAdjustBox = this.el,
      plus = freqAdjustBox.querySelector('[plus]'),
      plusLineOne = freqAdjustBox.querySelector('[plus-one]'),
      plusLineTwo = freqAdjustBox.querySelector('[plus-two]'),
      minus = freqAdjustBox.querySelector('[minus]'),
      text = freqAdjustBox.querySelector('a-text'),
      normalScale = '0.2 0.2 0.2',
      normalScaleSign = '1 1 1',
      hoverScaleSign = '1.1 1.2 2',
      oscIndex = freqAdjustBox.getAttribute('oscIndex');

    let currentFreqIndex = frequencies.indexOf(controllers[oscIndex].getOSCFrequency());


    // init
    freqAdjustBox.setAttribute('position', `${positionsX[oscIndex]} ${positionY - toneKeyHeightDefault} ${positionsZ[oscIndex]}`);
    freqAdjustBox.setAttribute('rotation', `0 ${rotationsY[oscIndex]} 0`);

    plusLineOne.setAttribute('width', '0.1');
    plusLineOne.setAttribute('height', '0.18');
    plusLineOne.setAttribute('depth', '0.1');
    plusLineTwo.setAttribute('width', '0.18');
    plusLineTwo.setAttribute('height', '0.1');
    plusLineTwo.setAttribute('depth', '0.1');

    minus.setAttribute('width', '0.18');
    minus.setAttribute('height', '0.1');
    minus.setAttribute('depth', '0.1');

    plus.setAttribute('position', '0.1 -0.22 0');
    minus.setAttribute('position', '-0.1 -0.22 0');

    text.setAttribute('value', frequencies[currentFreqIndex]);
    text.setAttribute('color', buttonColorActive);
    text.setAttribute('scale', '0.8 0.8 0.8');

    // hover effect & logic if hovering controls buttons
    plus.addEventListener('mouseenter', () => {
      plusLineOne.setAttribute('color', buttonColorHover);
      plusLineTwo.setAttribute('color', buttonColorHover);
      plus.setAttribute('scale', hoverScaleSign);
      if (isHoveringControl) {
        performClick(true);
      }
    });
    plus.addEventListener('mouseleave', () => {
      plusLineOne.setAttribute('color', boxColorDefault);
      plusLineTwo.setAttribute('color', boxColorDefault);
      plus.setAttribute('scale', normalScaleSign);
    });
    minus.addEventListener('mouseenter', () => {
      minus.setAttribute('color', buttonColorHover);
      minus.setAttribute('scale', hoverScaleSign);
      if (isHoveringControl) {
        performClick(false);
      }
    });
    minus.addEventListener('mouseleave', () => {
      minus.setAttribute('color', boxColorDefault);
      minus.setAttribute('scale', normalScaleSign);
    });

    // change freuquency
    plus.addEventListener('click', () => {
      if (isHoveringControl) return;
      performClick(true);
    });

    minus.addEventListener('click', () => {
      if (isHoveringControl) return;
      performClick(false);
    });

    function performClick(isPlus) {
      if (isPlus) {
        currentFreqIndex = (currentFreqIndex + 1) % frequencies.length;
        controllers[oscIndex].setOSCFrequency(frequencies[currentFreqIndex]);
        text.setAttribute('value', frequencies[currentFreqIndex]);
      } else {
        currentFreqIndex = ((currentFreqIndex - 1 + frequencies.length) % frequencies.length);
        controllers[oscIndex].setOSCFrequency(frequencies[currentFreqIndex]);
        text.setAttribute('value', frequencies[currentFreqIndex]);
      }

    }
  }
});

const potentiometerSelectorPositions = [];
let isSelectorPositionsSet = false;


AFRAME.registerComponent('potentiometer', {
  init: function () {
    const potentiometer = this.el,
      currentIndex = potentiometer.getAttribute('oscIndex'),
      /* knob = potentiometer.querySelector('[knob]'), */
      selector = potentiometer.querySelector('[selector]'),
      valueAreas = potentiometer.querySelectorAll('a-cylinder[class=clickable]'),
      thetaLength = valueAreas[0].getAttribute('theta-length'),
      values = potentiometer.querySelectorAll('a-text');


    if (!isSelectorPositionsSet) {
      getSelectorPositions();
    }

    // the value of the modulation frequency can be slightly different than initially set
    let currentModFreq = controllers[currentIndex].getOSCFreqModFreq();


    frequenciesModulation.forEach((ele, index) => {
      // making the current modulation frequency precisely like in the array
      let calc = ele - currentModFreq;
      calc = Math.abs(calc.toFixed(1));

      // current modulation frequency found
      if (calc == 0) {
        selector.setAttribute('theta-start', potentiometerSelectorPositions[index].position);
      }
    });



    /* 
        let positionCurrentModFreq = potentiometerSelectorPositions.find((el) => {
          el == currentModFreq
        }
        );
      */






    potentiometer.setAttribute('position', `${positionsX[currentIndex]} ${positionY - 1.5} ${positionsZ[currentIndex]}`);
    potentiometer.setAttribute('rotation', `0 ${rotationsY[currentIndex]} 0`);
    potentiometer.setAttribute('scale', '0.25 0.25 0.1');


    // put values on potentiometer
    values.forEach((value, i) => {
      value.setAttribute('value', frequenciesModulation[i]);
    })

    /* let currentSelectorPosition = selectorPositions[
      frequenciesModulation.indexOf(controllers[currentIndex].getOSCFreqModFreq())
    ]; */
/*     selector.setAttribute('theta-start', selectorPositions[currentIndex].position);
 */    selector.setAttribute('theta-length', 10);

    // get the modulation frequencies TODO get from controller


    // init the clickable areas
    valueAreas.forEach((valueArea, i) => {

      valueArea.setAttribute('color', 'red');
    });

    valueAreas.forEach((valueArea, i) => {

      valueArea.setAttribute('color', boxColorDefault);

      valueArea.addEventListener('mouseenter', () => {
        valueArea.setAttribute('color', buttonColorHover);

        if (isHoveringControl) {
          performClick(valueArea);
        }
      });

      valueArea.addEventListener('mouseleave', () => {
        valueArea.setAttribute('color', boxColorDefault);

        if (isHoveringControl) {
          performClick(valueArea);
        }
      })

      valueArea.addEventListener('click', (ev) => {
        if (isHoveringControl) return;
        performClick(valueArea);
      });
    });

    function performClick(valueArea) {
      const index = Array.from(valueAreas).indexOf(valueArea);
      // the appropriate modulation frequency comes via value area
      controllers[currentIndex].setOSCFreqModFreq(potentiometerSelectorPositions[index].modFreq);
      selector.setAttribute('theta-start', potentiometerSelectorPositions[index].position);
    }
    /**
     *  Calculates the positions for the selector and stores them together with the corresponding 
     *  modulation frequencies in potentiometerSelectorPositions.
     */
    function getSelectorPositions() {

      for (let i = 0; i < frequenciesModulation.length; i++) {
        let position = parseInt(valueAreas[i].getAttribute('theta-start')) + thetaLength / 2;
        let modFreq = frequenciesModulation[i];
        potentiometerSelectorPositions.push({ position, modFreq });
      }
      isSelectorPositionsSet = true;
    }
  }
});

