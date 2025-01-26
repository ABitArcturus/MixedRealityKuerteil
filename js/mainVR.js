import { getFrequency, getRMS } from "./synthesizer/analyser.js";
import { OSC_Controller } from "./synthesizer/oscController.js";
import { addAFrameElements } from "./addAFrameElements.js";

window.addEventListener('DOMContentLoaded', () => {
  addAFrameElements();
  activateOSC();
});

// list of available frequencies
const frequencies = [
  174, 196, 220, 261, 293, 329, 392,
  440, 493, 587, 659, 698, 784, 880,
  987, 1175, 1319, 1397, 1568, 1760, 1975,
  2093, 2349, 2637, 2794, 3136, 3520, 3951
];

// available modulation frequencies
const frequenciesModulation = [0.2, 0.7, 5.3, 8, 10, 15];

let isAudioActive = false;
let isHoveringControl = false;

const controllers = [];
export const isOSCPlaying = [];

/**
 * Initializes and configures several oscillators and saves them in the array controllers.
 */
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
  }
  controllers[0].setOSCFrequency(frequencies[0]);
  controllers[0].setOSCFreqModFreq(frequenciesModulation[0]);

  controllers[1].setOSCFrequency(frequencies[8]);
  controllers[1].setOSCFreqModFreq(frequenciesModulation[1]);
  controllers[1].setOSCWaveform("triangle");

  controllers[2].setOSCFrequency(frequencies[9]);
  controllers[2].setOSCFreqModFreq(frequenciesModulation[2]);

  controllers[3].setOSCFrequency(frequencies[10]);
  controllers[3].setOSCFreqModFreq(frequenciesModulation[3]);
  controllers[3].setOSCWaveform("square");

  controllers[4].setOSCFrequency(frequencies[11]);
  controllers[4].setOSCWaveform("triangle");
  controllers[4].setOSCFreqModFreq(frequenciesModulation[4]);

  controllers[5].setOSCFrequency(frequencies[12]);
  controllers[5].setOSCFreqModFreq(frequenciesModulation[5]);

  controllers[6].setOSCFrequency(frequencies[13]);
  controllers[6].setOSCWaveform("square");
}

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

// default button appearance
const buttonColorDefault = "#e5dddd",
  buttonColorHover = '#46ff33',
  buttonColorActive = 'lime',
  buttonWidthDefault = 0.4,
  buttonHeightDefault = 0.4,
  buttonDepthDefault = 0.1,
  toneKeyHeightDefault = buttonHeightDefault + 0.2;

//////////////////////////////////////////////////////////////////////////////

// available waveforms
const waveforms = ["sine", "square", "sawtooth", "triangle"];

// sinewave box - buttons to set the waveform
AFRAME.registerComponent('sinewave-box', {
  init: function () {
    const sinewaveBox = this.el,
      sineButton = sinewaveBox.querySelector('[sine]'),
      sineText = sinewaveBox.querySelector('a-text[value="sine"]'),
      squareButton = sinewaveBox.querySelector('[square]'),
      squareText = sinewaveBox.querySelector('a-text[value="square"]'),
      sawtoothButton = sinewaveBox.querySelector('[sawtooth]'),
      sawtoothText = sinewaveBox.querySelector('a-text[value="sawtooth"]'),
      triangleButton = sinewaveBox.querySelector('[triangle]'),
      triangleText = sinewaveBox.querySelector('a-text[value="triangle"]'),

      normalBoxScale = `${buttonWidthDefault} ${buttonHeightDefault / 2} ${buttonDepthDefault}`, // 0.2
      hoverBoxScale = `${buttonWidthDefault} ${buttonHeightDefault / 2} ${buttonDepthDefault + 0.1}`,
      normalTextScale = '1 2',
      currentIndex = sinewaveBox.getAttribute('osc-index');
    let currentWaveform = controllers[currentIndex].getOSCWaveform();

    // position parent box
    sinewaveBox.setAttribute('position', `${positionsX[currentIndex]} ${positionY + buttonHeightDefault * 3} ${positionsZ[currentIndex]}`);
    sinewaveBox.setAttribute('rotation', `0 ${rotationsY[currentIndex]} 0`);

    // scale texts
    sineText.setAttribute('scale', normalTextScale);
    squareText.setAttribute('scale', normalTextScale);
    sawtoothText.setAttribute('scale', normalTextScale);
    triangleText.setAttribute('scale', normalTextScale);

    // position texts
    sineText.setAttribute('position', `0 0 0.5`);
    squareText.setAttribute('position', `0 0 0.5`);
    sawtoothText.setAttribute('position', `0 0 0.5`);
    triangleText.setAttribute('position', `0 0 0.5`);


    // scale boxes
    sineButton.setAttribute('scale', normalBoxScale);
    squareButton.setAttribute('scale', normalBoxScale);
    sawtoothButton.setAttribute('scale', normalBoxScale);
    triangleButton.setAttribute('scale', normalBoxScale);

    // position boxes
    sineButton.setAttribute('position', `0 0 0`);
    squareButton.setAttribute('position', `0 -0.22 0`);
    sawtoothButton.setAttribute('position', `0 -0.44 0`);
    triangleButton.setAttribute('position', `0 -0.66 0`);

    // hover effect & logic if hovering controls buttons
    sineButton.addEventListener('mouseenter', () => {
      doHover(sineButton);
      if (isHoveringControl) {
        performClick('sine');
      }
    });
    sineButton.addEventListener('mouseleave', () => {
      doUnhover(sineButton);
    });
    squareButton.addEventListener('mouseenter', () => {
      doHover(squareButton);
      if (isHoveringControl) {
        performClick('square');
      }
    });
    squareButton.addEventListener('mouseleave', () => {
      doUnhover(squareButton);
    });
    sawtoothButton.addEventListener('mouseenter', () => {
      doHover(sawtoothButton);
      if (isHoveringControl) {
        performClick('sawtooth');
      }
    });
    sawtoothButton.addEventListener('mouseleave', () => {
      doUnhover(sawtoothButton);
    });
    triangleButton.addEventListener('mouseenter', () => {
      doHover(triangleButton);
      if (isHoveringControl) {
        performClick('triangle');
      }
    });
    triangleButton.addEventListener('mouseleave', () => {
      /*   if (isHoveringControl) return; */
      doUnhover(triangleButton);
    });

    /**
     * Performs hover effect.
     * 
     * @param {*} elementToHover The element to hover.
     */
    function doHover(elementToHover) {
      elementToHover.setAttribute('color', buttonColorHover);
      elementToHover.setAttribute('animation', {
        property: 'scale',
        to: hoverBoxScale,
        dur: 50
      });
    }

    /**
     * Performs unhover effect.
     * 
     * @param {*} elementToUnhover Element to unhover.
     */
    function doUnhover(elementToUnhover) {
      elementToUnhover.setAttribute('color', buttonColorDefault);
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
    });
    sawtoothButton.addEventListener('click', () => {
      performClick('sawtooth');
    });
    triangleButton.addEventListener('click', () => {
      performClick('triangle');

    });

    /**
     * Colors the active waveform button.
     */
    function colorActiveWaveform() {
      sineButton.setAttribute('color', buttonColorDefault);
      squareButton.setAttribute('color', buttonColorDefault);
      sawtoothButton.setAttribute('color', buttonColorDefault);
      triangleButton.setAttribute('color', buttonColorDefault);

      currentWaveform = controllers[currentIndex].getOSCWaveform();
      const ele = sinewaveBox.querySelector(`[${currentWaveform}]`);

      ele.setAttribute('color', buttonColorActive);
    }

    /**
     * Performs waveform and button color change.
     * 
     * @param {*} waveformToSet Waveform to set.
     */
    function performClick(waveformToSet) {
      controllers[currentIndex].setOSCWaveform(waveformToSet);
      colorActiveWaveform();
    }
    colorActiveWaveform();

  },
});

//////////////////////////////////////////////////////////////////////////////

/**
 * Controls the tone keys.
 */
AFRAME.registerComponent('tone-key', {
  init: function () {
    const el = this.el;
    const normalScale = `${buttonWidthDefault} ${toneKeyHeightDefault} ${buttonDepthDefault}`,
      hoverScale = `${buttonWidthDefault + 0.05} ${buttonHeightDefault + 0.25} ${buttonDepthDefault + 0.1}`,
      currentIndex = el.getAttribute('osc-index');

    // init
    el.setAttribute('scale', normalScale);
    el.setAttribute('position', `${positionsX[currentIndex]} ${positionY} ${positionsZ[currentIndex]}`);
    el.setAttribute('rotation', `0 ${rotationsY[currentIndex]} 0`);

    // hover effect & trigger oscillator
    el.addEventListener('mouseenter', () => {
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
      el.setAttribute('color', buttonColorDefault);
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

//////////////////////////////////////////////////////////////////////////////

/**
 * Controls the frequency of the oscillator.
 */
AFRAME.registerComponent('freq-adjust', {

  init: function () {
    const freqAdjustBox = this.el,
      plus = freqAdjustBox.querySelector('[plus]'),
      plusLineOne = freqAdjustBox.querySelector('[plus-one]'),
      plusLineTwo = freqAdjustBox.querySelector('[plus-two]'),
      minus = freqAdjustBox.querySelector('[minus]'),
      text = freqAdjustBox.querySelector('a-text'),
      normalScaleSign = '1 1 1',
      hoverScaleSign = '1.1 1.2 2',
      oscIndex = freqAdjustBox.getAttribute('osc-index');

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
      plusLineOne.setAttribute('color', buttonColorDefault);
      plusLineTwo.setAttribute('color', buttonColorDefault);
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
      minus.setAttribute('color', buttonColorDefault);
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

    /**
     * Changes the frequency of the oscillator and displays it accordingly.
     * 
     * @param {*} isPlus If the frequency should be increased. Otherwise it'll be decreased.
     */
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

//////////////////////////////////////////////////////////////////////////////

const potentiometerSelectorPositions = [];
let isSelectorPositionsSet = false;

/**
 * Controls the modulation frequency of the oscillator.
 */
AFRAME.registerComponent('potentiometer', {
  init: function () {
    const potentiometer = this.el,
      currentIndex = potentiometer.getAttribute('osc-index'),
      selector = potentiometer.querySelector('[selector]'),
      valueAreas = potentiometer.querySelectorAll('a-cylinder[class=clickable]'),
      thetaLength = valueAreas[0].getAttribute('theta-length'),
      values = potentiometer.querySelectorAll('a-text');

    // init
    potentiometer.setAttribute('position', `${positionsX[currentIndex]} ${positionY - 1.5} ${positionsZ[currentIndex]}`);
    potentiometer.setAttribute('rotation', `0 ${rotationsY[currentIndex]} 0`);
    potentiometer.setAttribute('scale', '0.25 0.25 0.1');

    // init selector
    if (!isSelectorPositionsSet) {
      getSelectorPositions();
    }

    // the value of the modulation frequency can be slightly different than initially set
    let currentModFreq = controllers[currentIndex].getOSCFreqModFreq();
    frequenciesModulation.forEach((ele, index) => {

      // making the current modulation frequency to match exactly with the frequency in the array
      let calc = ele - currentModFreq;
      calc = Math.abs(calc.toFixed(1));

      // current modulation frequency found
      if (calc == 0) {
        // init/position selector
        selector.setAttribute('theta-start', potentiometerSelectorPositions[index].position);
      }
    });

    // put values on potentiometer
    values.forEach((value, i) => {
      value.setAttribute('value', frequenciesModulation[i]);
    })

    selector.setAttribute('theta-length', 10);

    // init the clickable areas
    valueAreas.forEach((valueArea, i) => {
      valueArea.setAttribute('color', 'red');
    });

    // add event listeners to all clickable areas
    valueAreas.forEach((valueArea, i) => {

      valueArea.setAttribute('color', buttonColorDefault);

      valueArea.addEventListener('mouseenter', () => {
        valueArea.setAttribute('color', buttonColorHover);

        if (isHoveringControl) {
          performClick(valueArea);
        }
      });

      valueArea.addEventListener('mouseleave', () => {
        valueArea.setAttribute('color', buttonColorDefault);

        if (isHoveringControl) {
          performClick(valueArea);
        }
      })

      valueArea.addEventListener('click', (ev) => {
        if (isHoveringControl) return;
        performClick(valueArea);
      });
    });

    /**
     * Handles the actions when clicked on a corresponding area of the potentiometer.
     * 
     * @param {*} valueArea The area that was clicked.
     */
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

/**
 * Enables control of all the buttons by hovering. 
 */
AFRAME.registerComponent('enable-hover-control', {
  init: function () {
    const box = this.el,
      button = box.querySelector('a-box'),
      textTop = box.querySelector('a-text[value="hover control"]'),
      textBottom = box.querySelector('a-text[value="inactive"]'),
      normalBoxScale = `0.8 ${buttonHeightDefault} ${buttonDepthDefault}`,
      hoverBoxScale = `0.9 ${buttonHeightDefault + 0.1} ${buttonDepthDefault}`,
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
        button.setAttribute('color', buttonColorDefault);
        textBottom.setAttribute('value', "inactive");
      } else {
        isHoveringControl = true;
        button.setAttribute('color', "red");
        textBottom.setAttribute('value', "active");
      }

    });

    button.addEventListener('mouseleave', () => {
      if (!isHoveringControl) {
        button.setAttribute('color', buttonColorDefault);
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

//////////////////////////////////////////////////////////////////////////////

// aframe back button
AFRAME.registerComponent('aframe-back-button', {

  init: function () {

    const el = this.el,
      normalScale = `0.5 0.5 0.5`,
      hoverScale = `0.6 0.6 0.6`;

    // init
    el.setAttribute('position', `${positionsX[0] - 1.5} 0.5 ${positionsZ[0] + positionZGap * 2}`);
    el.setAttribute('rotation', `0 60 0`);
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

//////////////////////////////////////////////////////////////////////////////

const helpOverlay = document.getElementById('help-overlay');
let isHelpActive = false;

// html help button
document.getElementById('help-button').addEventListener('click', toggleHelpWindow);

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

    // toggle visibility
    button.addEventListener('click', function () {
      if (isHoveringControl) return;
      toggleHelpWindow();
    });

    // hover effect & logic if hovering controls buttons
    button.addEventListener('mouseenter', function () {
      el.setAttribute('scale', hoverScale);
      if (isHoveringControl) {
        toggleHelpWindow();
      }
    });

    button.addEventListener('mouseleave', function () {
      el.setAttribute('scale', normalScale);
      if (isHelpActive) {
        toggleHelpWindow();
      }
    });

  }
});

/**
 * Toggles the visibility of the help window.
 */
function toggleHelpWindow() {
  if (helpOverlay.style.display === 'flex') {
    helpOverlay.style.display = 'none';
    isHelpActive = false;
  } else {
    helpOverlay.style.display = 'flex';
    isHelpActive = true;
  }
}

//////////////////////////////////////////////////////////////////////////////

// check if light effect is enabled
const urlParams = new URLSearchParams(window.location.search);
const isLightEffect = urlParams.get('lightEffect') === 'true';

// a-frame light effect
const lightEffect = document.querySelector('#light-effect');

const toneVisualizer = document.getElementById("tone-visualizer");
toneVisualizer.setAttribute('color', buttonColorActive);
toneVisualizer.setAttribute('depth', '0.1');
toneVisualizer.setAttribute('opacity', '0.5');
const toneVisualizerDefaultHeight = 0, toneVisualizerDefaultWidth = 1;
/* const minHeight = 0.5, maxHeight = 5; */
const minFreq = 20, maxFreq = 20000;

/**
 * Renders the tone visualizer.
 */
function tick() {
  // revert to default appearance
  toneVisualizer.setAttribute('height', toneVisualizerDefaultHeight);
  toneVisualizer.setAttribute('width', toneVisualizerDefaultWidth);
  if (isLightEffect) {
    lightEffect.setAttribute('visible', false);
  }

  // check if any oscillator is playing
  if (isOSCPlaying.includes(true)) {

    // frequency
    let freq = getFrequency();
    const normalizedFreq = (freq - minFreq) / (maxFreq - minFreq);
    toneVisualizer.setAttribute('width', `${toneVisualizerDefaultWidth + normalizedFreq * 100}`);

    // RMS
    const rms = getRMS() / 1000;
    const normalizedRMS = Math.min(1, rms);
    toneVisualizer.setAttribute('height', `${normalizedRMS * 100}`);
    console.log("rms: " + rms, "normalizedRMS: " + normalizedRMS);

    // addition light effect - but requires more processing power 
    if (isLightEffect) {
      lightEffect.setAttribute('visible', true);
      lightEffect.setAttribute('light', `type: point; intensity: ${normalizedFreq * 10}; distance: 10; decay: 2`);
    }
  }
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);

//////////////////////////////////////////////////////////////////////////////

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
  } else {
    controllers[controllerIndex].stopOSC();
  }
}