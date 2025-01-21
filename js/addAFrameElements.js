import { totalNumberOfKeys } from "./mainVR.js";


export function addAFrameElements() {
    // adds the waveform buttons to the scene
    for (let i = 0; i < totalNumberOfKeys; i++) {
        const sinewaveBox = document.createElement('a-entity');
        sinewaveBox.setAttribute('sinewave-box', '');
        sinewaveBox.setAttribute('oscIndex', i);

        const sineBox = document.createElement('a-box');
        sineBox.setAttribute('sine', '');
        sineBox.setAttribute('class', 'clickable');
        sinewaveBox.appendChild(sineBox);

        const sineText = document.createElement('a-text');
        sineText.setAttribute('value', 'sine');
        sineText.setAttribute('align', 'center');
        sinewaveBox.appendChild(sineText);

        const squareBox = document.createElement('a-box');
        squareBox.setAttribute('square', '');
        squareBox.setAttribute('class', 'clickable');
        sinewaveBox.appendChild(squareBox);

        const squareText = document.createElement('a-text');
        squareText.setAttribute('value', 'square');
        squareText.setAttribute('align', 'center');
        sinewaveBox.appendChild(squareText);

        const sawtoothBox = document.createElement('a-box');
        sawtoothBox.setAttribute('sawtooth', '');
        sawtoothBox.setAttribute('class', 'clickable');
        sinewaveBox.appendChild(sawtoothBox);

        const sawtoothText = document.createElement('a-text');
        sawtoothText.setAttribute('value', 'sawtooth');
        sawtoothText.setAttribute('align', 'center');
        sinewaveBox.appendChild(sawtoothText);

        const triangleBox = document.createElement('a-box');
        triangleBox.setAttribute('triangle', '');
        triangleBox.setAttribute('class', 'clickable');
        sinewaveBox.appendChild(triangleBox);

        const triangleText = document.createElement('a-text');
        triangleText.setAttribute('value', 'triangle');
        triangleText.setAttribute('align', 'center');
        sinewaveBox.appendChild(triangleText);

        document.querySelector('a-scene').appendChild(sinewaveBox);

        // frequency adjust

        const freqAdjust = document.createElement('a-entity');
        freqAdjust.setAttribute('freq-adjust', '');
        freqAdjust.setAttribute('oscIndex', i);

        // plus
        const freqAdjustPlus = document.createElement('a-entity');
        freqAdjustPlus.setAttribute('plus', '');
        freqAdjust.appendChild(freqAdjustPlus);

        const freqAdjustPlusOne = document.createElement('a-box');
        freqAdjustPlusOne.setAttribute('plus-one', '');
        freqAdjustPlusOne.setAttribute('class', 'clickable');
  /*       freqAdjustPlusOne.setAttribute('width', '0.5');
        freqAdjustPlusOne.setAttribute('height', '1'); */
        freqAdjustPlus.appendChild(freqAdjustPlusOne);

        const freqAdjustPlusTwo = document.createElement('a-box');
        freqAdjustPlusTwo.setAttribute('plus-two', '');
        freqAdjustPlusTwo.setAttribute('class', 'clickable');
      /*   freqAdjustPlusTwo.setAttribute('width', '1');
        freqAdjustPlusTwo.setAttribute('height', '0.5'); */
        freqAdjustPlus.appendChild(freqAdjustPlusTwo);

        // minus
        const freqAdjustMinus = document.createElement('a-box');
        freqAdjustMinus.setAttribute('minus', '');
        freqAdjustMinus.setAttribute('class', 'clickable');
        freqAdjust.appendChild(freqAdjustMinus);

        const freqAdjustText = document.createElement('a-text');
        freqAdjustText.setAttribute('side', 'double');
        freqAdjustText.setAttribute('align', 'center');
        freqAdjust.appendChild(freqAdjustText);

        document.querySelector('a-scene').appendChild(freqAdjust);
    }
}
