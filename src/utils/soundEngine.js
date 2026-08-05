// Synthesized Atmospheric Soundscapes Engine using Web Audio API

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.rainGain = null;
    this.windGain = null;
    this.sunGain = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.currentWeatherType = 'clear-day';
    this.volume = 0.5;
  }

  init() {
    if (this.audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.audioCtx = new AudioContext();

    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    this.masterGain.connect(this.audioCtx.destination);
  }

  setVolume(vol) {
    this.volume = vol;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setTargetAtTime(vol, this.audioCtx.currentTime, 0.1);
    }
  }

  toggleSound(weatherType = 'clear-day') {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play(weatherType);
      return true;
    }
  }

  play(weatherType = 'clear-day') {
    this.init();
    if (!this.audioCtx) return;

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    this.stop();
    this.isPlaying = true;
    this.currentWeatherType = weatherType;

    const t = (weatherType || '').toLowerCase();

    if (t.includes('rain') || t.includes('thunder')) {
      this.createRainSound();
    } else if (t.includes('snow') || t.includes('fog') || t.includes('cloud')) {
      this.createWindSound();
    } else {
      this.createSunAmbientSound();
    }
  }

  createRainSound() {
    // Pink noise buffer for rain drop texture
    const bufferSize = 2 * this.audioCtx.sampleRate;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to simulate soft raindrops hitting surface
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;

    this.rainGain = this.audioCtx.createGain();
    this.rainGain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);
    whiteNoise.start();
    this.activeNodes = [whiteNoise];
  }

  createWindSound() {
    const bufferSize = 2 * this.audioCtx.sampleRate;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 350;
    filter.Q.value = 3.0;

    // LFO to modulate wind frequency (breezy effect)
    const lfo = this.audioCtx.createOscillator();
    lfo.frequency.value = 0.2;
    const lfoGain = this.audioCtx.createGain();
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    this.windGain = this.audioCtx.createGain();
    this.windGain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);

    noise.connect(filter);
    filter.connect(this.windGain);
    this.windGain.connect(this.masterGain);
    noise.start();
    this.activeNodes = [noise, lfo];
  }

  createSunAmbientSound() {
    // Soft harmonic ambient chord (432Hz aligned relaxing tone)
    const freqs = [216, 288, 324, 432];
    this.activeNodes = [];

    this.sunGain = this.audioCtx.createGain();
    this.sunGain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
    this.sunGain.connect(this.masterGain);

    freqs.forEach((f) => {
      const osc = this.audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;

      const oscGain = this.audioCtx.createGain();
      oscGain.gain.value = 0.2;

      osc.connect(oscGain);
      oscGain.connect(this.sunGain);
      osc.start();
      this.activeNodes.push(osc);
    });
  }

  stop() {
    if (this.activeNodes) {
      this.activeNodes.forEach((node) => {
        try { node.stop(); } catch (e) { /* ignore */ }
      });
      this.activeNodes = [];
    }
    this.isPlaying = false;
  }
}

export const soundEngine = new SoundEngine();
