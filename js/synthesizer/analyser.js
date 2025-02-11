import { audioCtx, analyser } from "./oscController.js";

/* const canvas = document.getElementById("analyserCanvas");
const canvasCtx = canvas.getContext("2d"); */
const bufferLength = analyser.frequencyBinCount;
// values from 0 - 255
const dataArrayUint8 = new Uint8Array(bufferLength);

const nyquist = audioCtx.sampleRate / 2;

const maxFreq = 20000,
    minFreq = 20;

/**
 * Visualizes the frequency data in the canvas.
 * Works with values from 0 to 255.
 *
 * @return {void}
 */
function visualize() {

    // get the data from the analyser
    analyser.getByteFrequencyData(dataArrayUint8);
    console.log(dataArrayUint8);
    /* canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = canvas.width / bufferLength; */

    for (let i = 0; i < bufferLength; i++) {
        const frequency = getFrequencyByIndex(i);

        // skip frequencies outside our hearing spectrum
        if (frequency < minFreq || frequency > maxFreq) {
            continue;
        }

        const barHeight = dataArrayUint8[i];
       /*  const xPosition = (frequency / maxFreq) * canvas.width;

        canvasCtx.fillStyle = "rgb(0, " + (barHeight + 100) + ", 0)";
        canvasCtx.fillRect(xPosition, canvas.height - barHeight / 2, barWidth, barHeight);
 */    }
    /*     requestAnimationFrame(visualize); */

}
/**
 * Returns the root mean square value of the audio.
 * 
 * @returns {number} The root mean square value.
 */
function getRMS() {
    analyser.getFloatFrequencyData(dataArrayFloat32);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
        sum += Math.pow(dataArrayFloat32[i], 2);
    }

    const rms = Math.sqrt(sum / bufferLength);
    return rms;
}

/**
 * Calculates the frequency for the given bin index.
 *
 * @param {number} index The bin index.
 * @return {number} The calculated frequency.
 */
function getFrequencyByIndex(index) {
    return (index * nyquist) / bufferLength;
}

/**
 * Returns the frequency with the highest amplitude/the currently playing frequency.
 * 
 * @returns The frequency value.
 */
function getFrequency() {
    analyser.getByteFrequencyData(dataArrayUint8);

    let maxAmplitude = 0;
    let maxIndex = 0;

    for (let i = 0; i < bufferLength; i++) {
        if (dataArrayUint8[i] > maxAmplitude) {
            maxAmplitude = dataArrayUint8[i];
            maxIndex = i;
        }
    }
    const frequency = maxIndex * nyquist / bufferLength;
    return frequency;
}

/* visualize();
 */
//////////////////////////////////////////////////

/* set the threshold for the average gain here (0-1).
* (the larger the number, the louder)
* 
*/
const AVERAGE_GAIN_THRESHOLD = 0;

/**
 * Checks the average gain over a AVERAGE_GAIN_THRESHOLD.
 *
 * @return {void}
 */
function checkAverageGainOverThreshold() {
    // get the data from the analyser
    analyser.getByteFrequencyData(dataArrayUint8);

    // get the average gain first
    const averageGain = calculateAverageGain(dataArrayUint8);

    // trigger fct if average gain is higher than threshold
    if (averageGain > AVERAGE_GAIN_THRESHOLD) {
        return handleHighAverageGain(averageGain);


    }

    /*  requestAnimationFrame(
         () => checkAverageGainOverThreshold()
     ); */
}

/**
 * Calculates the average gain value from the given data array.
 * Works with values from 0 to 255 but normalizes them to the range 0-1.
 *
 * @param {number[]} dataArray - The array of gain values.
 * @return {number} The average gain value.
 */
function calculateAverageGain() {
    // get the data from the analyser
    analyser.getByteFrequencyData(dataArrayUint8);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
        // normalize the data to the range 0-1
/*         sum += dataArrayUint8[i] / 255;
 */        sum += dataArrayUint8[i];

    }
    return sum / bufferLength;
}
////////////////////////////////////////////////

/**
 * Is triggered when the average gain is higher than the threshold.
 *
 * @param {number} averageGain - The average gain value to log.
 * @return {void}
 */
function handleHighAverageGain(averageGain) {

    return (averageGain * 100).toFixed(3);
}

/* checkAverageGainOverThreshold();
 */
// maximum value = 0
const dataArrayFloat32 = new Float32Array(bufferLength);

// boundary values: changing these values changes which logic fct is triggered
const LOW_FREQ_MIN = 20,
    LOW_FREQ_MAX = 500,
    MID_FREQ_MIN = 501,
    MID_FREQ_MAX = 2000,
    HIGH_FREQ_MIN = 2001,
    HIGH_FREQ_MAX = 20000;

/**
 * Logs the frequency and gain of the current audio if the gain is above a certain threshold.
 * Works with a maximum value of 0.
 *
 * @param {number} gainThreshold - The gain threshold in decibels.
 * @return {void}
 */
function logRelevantFrequencies(gainThreshold) {
    function analyze() {
        // get the data from the analyser
        analyser.getFloatFrequencyData(dataArrayFloat32);

        // find the maximum gain and corresponding frequency
        let maxGain = -Infinity;
        let maxFreq = 0;

        for (let i = 0; i < bufferLength; i++) {
            const frequency = (i * nyquist) / bufferLength;
            const gain = dataArrayFloat32[i];

            if (gain > maxGain) {
                maxGain = gain;
                maxFreq = frequency;
            }
        }

        if (maxGain > gainThreshold) {
            /*             console.log("frequency: ", maxFreq.toFixed(2), "Hz, gain: ", maxGain.toFixed(2), " dB");
             */
            // checking if corresponding frequencies within the boundaries are being played          
            if (maxFreq >= LOW_FREQ_MIN && maxFreq <= LOW_FREQ_MAX) {
/*                 handleLowFrequency(maxFreq, maxGain);
 */            } else if (maxFreq > MID_FREQ_MIN && maxFreq <= MID_FREQ_MAX) {
/*                 handleMidFrequency(maxFreq, maxGain);
 */            } else if (maxFreq > HIGH_FREQ_MIN && maxFreq <= HIGH_FREQ_MAX) {
/*                 handleHighFrequency(maxFreq, maxGain);
 */            }
        }
        // wait 70 ms
        setTimeout(analyze, 70);
    }
    analyze();
}
// changing this value changes when the game logic functions are triggered
const GAIN_THRESHOLD = -70;
logRelevantFrequencies(GAIN_THRESHOLD);

/**
 * Is triggered when the audio frequency is between LOW_FREQ_MIN and LOW_FREQ_MAX Hz.
 * Works with values from GAIN_THRESHOLD to 0 (the larger the number, the louder).
 * The typical maximum value when one oscillator is played is -14 dB.
 * When both oscillators are played simultaneously, with the same frequency, it reaches -8 dB.
 * 
 * @param {number} frequency - The frequency value.
 * @param {number} gain - The gain value.
 * @return {void}
 */
function handleLowFrequency(frequency, gain) {
    console.log("low frequency: ", frequency.toFixed(2), "Hz, gain: ", gain.toFixed(2), " dB");
}

/**
 * Is triggered when the audio frequency is between MID_FREQ_MIN and MID_FREQ_MAX Hz.
 * Works with values from GAIN_THRESHOLD to 0 (the larger the number, the louder).
 * The typical maximum value when one oscillator is played is -14 dB.
 * When both oscillators are played simultaneously, with the same frequency, it reaches -8 dB.
 *
 * @param {number} frequency - The frequency value.
 * @param {number} gain - The gain value.
 * @return {void}
 */
function handleMidFrequency(frequency, gain) {
    console.log("mid frequency: ", frequency.toFixed(2), " Hz, gain: ", gain.toFixed(2), " dB");

}

/**
 * Is triggered when the audio frequency is between HIGH_FREQ_MIN and HIGH_FREQ_MAX Hz.
 * Works with values from GAIN_THRESHOLD to 0 (the larger the number, the louder).
 * The typical maximum value when one oscillator is played is -14 dB.
 * When both oscillators are played simultaneously, with the same frequency, it reaches -8 dB.
 *
 * @param {number} frequency - The frequency value.
 * @param {number} gain - The gain value.
 * @return {void}
 */
function handleHighFrequency(frequency, gain) {
    console.log("high frequency: ", frequency.toFixed(2), " Hz, gain: ", gain.toFixed(2), " dB");
}

export { visualize, checkAverageGainOverThreshold, calculateAverageGain, getFrequency, getRMS };