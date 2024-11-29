import { instantiateFaustModuleFromFile,
  LibFaust,
  FaustMonoDspGenerator,
  FaustCompiler } from "@grame/faustwasm";


// initialize the libfaust wasm
const faustModule = await instantiateFaustModuleFromFile("../node_modules/@grame/faustwasm/libfaust-wasm/libfaust-wasm.js");

// Get the Faust compiler
const libFaust = new LibFaust(faustModule);
// @ts-ignore
window.libFaust = libFaust;
console.log(libFaust.version());

const compiler = new FaustCompiler(libFaust);
const generator = new FaustMonoDspGenerator();
const sampleRate = 48000;
const name = "oscillator"
const argv = ["-I", "libraries/"];
const code = `
import("stdfaust.lib");
freq = hslider("Frequency", 440, 20, 2000, 1);
amp = hslider("Amplitude", 0.5, 0, 1, 0.01);
process = os.osc(freq) * amp;
`;
// Compile the DSP
await generator.compile(compiler, name, code, argv.join(" "));
const audioContext = new AudioContext();


document.body.onclick = async () => {

  audioContext.resume();
  const node = await generator.createNode(audioContext);

  if(node) {
    node.connect(audioContext.destination);
    node.start();

    // Create a slider to control the frequency
    const freqLabel = document.createElement('label');
    freqLabel.textContent = 'Frequency';
    document.body.appendChild(freqLabel);
    const slider = document.createElement('input');
    slider.id = 'freqSlider';
    slider.type = 'range';
    slider.min = '20';
    slider.max = '2000';
    slider.value = '440';
    slider.step = '1';
    document.body.appendChild(slider);

    const ampLabel = document.createElement('label');
    ampLabel.textContent = 'Amplitude';
    document.body.appendChild(ampLabel);
    const ampSlider = document.createElement('input');
    ampSlider.id = 'ampSlider';
    ampSlider.type = 'range';
    ampSlider.min = '0';
    ampSlider.max = '1';
    ampSlider.value = '0.5';
    ampSlider.step = '0.01';
    document.body.appendChild(ampSlider);

    // Update the frequency parameter when the slider value changes
    slider.addEventListener('input', (event) => {
      const frequency = parseFloat((event.target as HTMLInputElement).value);
      node.setParamValue('/oscillator/Frequency', frequency);
    });

    ampSlider.addEventListener('input', (event) => {
      const amplitude = parseFloat((event.target as HTMLInputElement).value);
      node.setParamValue('/oscillator/Amplitude', amplitude);
    });
  }

  document.body.onclick = null;
}

//after page loads and you click the body, need to hit save on this file again to hot reload
//and get web audio to properly initialize after a click