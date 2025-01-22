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

        // potentiometer
        const potentiometer = document.createElement('a-entity');
        potentiometer.setAttribute('potentiometer', '');
        potentiometer.setAttribute('oscIndex', i);

        /*  const knob = document.createElement('a-cylinder');
         knob.setAttribute('knob', '');
         knob.setAttribute('rotation', '90 0 0');
         knob.setAttribute('class', 'clickable');
         potentiometer.appendChild(knob); */

        const selector = document.createElement('a-cylinder');
        selector.setAttribute('selector', '');
        selector.setAttribute('color', 'black');
/*         selector.setAttribute('opacity', '0.5');
 */     /*    selector.setAttribute('radius-inner', '0.1');
        selector.setAttribute('radius-outer', '2'); */
        selector.setAttribute('scale', '1 1 0.8');
        selector.setAttribute('position', '0 0 0.1');
        selector.setAttribute('rotation', '-90 0 0');
        potentiometer.appendChild(selector);

        const valueArea1 = document.createElement('a-cylinder');
        valueArea1.setAttribute('value-area1', '');
        valueArea1.setAttribute('class', 'clickable');
        /*         valueArea1.setAttribute('color', 'grey');
         */     /*    valueArea1.setAttribute('radius-inner', '1');
               valueArea1.setAttribute('radius-outer', '2'); */
        valueArea1.setAttribute('theta-start', '0');
        valueArea1.setAttribute('theta-length', '60');
        valueArea1.setAttribute('rotation', '-90 0 0');
        potentiometer.appendChild(valueArea1);

        const valueArea2 = document.createElement('a-cylinder');
        valueArea2.setAttribute('value-area2', '');
        valueArea2.setAttribute('class', 'clickable');
/*         valueArea2.setAttribute('color', 'darkgrey');
 */      /*   valueArea2.setAttribute('radius-inner', '1');
        valueArea2.setAttribute('radius-outer', '1.2'); */
        valueArea2.setAttribute('theta-start', '60');
        valueArea2.setAttribute('theta-length', '60');
        valueArea2.setAttribute('rotation', '-90 0 0');
        potentiometer.appendChild(valueArea2);

        const valueArea3 = document.createElement('a-cylinder');
        valueArea3.setAttribute('value-area3', '');
        valueArea3.setAttribute('class', 'clickable');
/*         valueArea3.setAttribute('color', 'grey');
 */    /*     valueArea3.setAttribute('radius-inner', '1');
        valueArea3.setAttribute('radius-outer', '1.2'); */
        valueArea3.setAttribute('theta-start', '120');
        valueArea3.setAttribute('theta-length', '60');
        valueArea3.setAttribute('rotation', '-90 0 0');
        potentiometer.appendChild(valueArea3);

        const valueArea4 = document.createElement('a-cylinder');
        valueArea4.setAttribute('value-area4', '');
        valueArea4.setAttribute('class', 'clickable');
/*         valueArea4.setAttribute('color', 'darkgrey');
 */    /*     valueArea4.setAttribute('radius-inner', '1');
        valueArea4.setAttribute('radius-outer', '1.2'); */
        valueArea4.setAttribute('theta-start', '180');
        valueArea4.setAttribute('theta-length', '60');
        valueArea4.setAttribute('rotation', '-90 0 0');
        potentiometer.appendChild(valueArea4);

        const valueArea5 = document.createElement('a-cylinder');
        valueArea5.setAttribute('value-area5', '');
        valueArea5.setAttribute('class', 'clickable');
/*         valueArea5.setAttribute('color', 'grey');
 */      /*   valueArea5.setAttribute('radius-inner', '1');
        valueArea5.setAttribute('radius-outer', '1.2'); */
        valueArea5.setAttribute('theta-start', '240');
        valueArea5.setAttribute('theta-length', '60');
        valueArea5.setAttribute('rotation', '-90 0 0');
        potentiometer.appendChild(valueArea5);

        const valueArea6 = document.createElement('a-cylinder');
        valueArea6.setAttribute('value-area6', '');
        valueArea6.setAttribute('class', 'clickable');
/*         valueArea6.setAttribute('color', 'darkgrey');
 */      /*   valueArea6.setAttribute('radius-inner', '1');
        valueArea6.setAttribute('radius-outer', '1.2'); */
        valueArea6.setAttribute('theta-start', '300');
        valueArea6.setAttribute('theta-length', '60');
        valueArea6.setAttribute('rotation', '-90 0 0');
        potentiometer.appendChild(valueArea6);

        // an x -90 rotated cylinder starts drawing at 12 o'clock

        const valueText1 = document.createElement('a-text');
        valueText1.setAttribute('value-text1', '');
        valueText1.setAttribute('position', '0.4 0.6 0.5');
        valueText1.setAttribute('align', 'center');
        potentiometer.appendChild(valueText1);

        const valueText2 = document.createElement('a-text');
        valueText2.setAttribute('value-text2', '');
        valueText2.setAttribute('position', '0.6 0 0.5');
        valueText2.setAttribute('align', 'center');
        potentiometer.appendChild(valueText2);

        const valueText3 = document.createElement('a-text');
        valueText3.setAttribute('value-text3', '');
        valueText3.setAttribute('position', '0.4 -0.6 0.5');
        valueText3.setAttribute('align', 'center');
        potentiometer.appendChild(valueText3);

        const valueText4 = document.createElement('a-text');
        valueText4.setAttribute('value-text4', '');
        valueText4.setAttribute('position', '-0.4 -0.6 0.5');
        valueText4.setAttribute('align', 'center');
        potentiometer.appendChild(valueText4);

        const valueText5 = document.createElement('a-text');
        valueText5.setAttribute('value-text5', '');
        valueText5.setAttribute('position', '-0.6 0 0.5');
        valueText5.setAttribute('align', 'center');
        potentiometer.appendChild(valueText5);

        const valueText6 = document.createElement('a-text');
        valueText6.setAttribute('value-text6', '');
        valueText6.setAttribute('position', '-0.4 0.6 0.5');
        valueText6.setAttribute('align', 'center');
        potentiometer.appendChild(valueText6);

        document.querySelector('a-scene').appendChild(potentiometer);
    }
}
