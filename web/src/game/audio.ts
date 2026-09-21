// Audio sintetizado via WebAudio (sem depender de arquivos externos).
// Espelha src/audio.py: SFX (select/confirm/success/error/back) + musica de fundo.

type Sfx = "select" | "confirm" | "success" | "error" | "back";

interface Track {
  osc: OscillatorNode[];
  gain: GainNode;
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private current: Track | null = null;
  private currentName: string | null = null;
  private musicVolume = 0.6;
  private soundVolume = 0.8;

  private ensure(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolume * 0.18;
      this.sfxGain.gain.value = this.soundVolume;
      this.musicGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  setVolumes(music: number, sound: number) {
    this.musicVolume = music;
    this.soundVolume = sound;
    if (this.musicGain) this.musicGain.gain.value = music * 0.18;
    if (this.sfxGain) this.sfxGain.gain.value = sound;
  }

  playSfx(name: Sfx) {
    const ctx = this.ensure();
    if (!ctx || !this.sfxGain) return;
    const specs: Record<Sfx, { freq: number; type: OscillatorType; dur: number; slide?: number }> = {
      select: { freq: 440, type: "triangle", dur: 0.07 },
      confirm: { freq: 620, type: "square", dur: 0.1, slide: 320 },
      success: { freq: 523, type: "triangle", dur: 0.28, slide: 400 },
      error: { freq: 180, type: "sawtooth", dur: 0.22, slide: -60 },
      back: { freq: 300, type: "sine", dur: 0.09, slide: -120 },
    };
    const s = specs[name];
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = s.type;
    osc.frequency.setValueAtTime(s.freq, ctx.currentTime);
    if (s.slide) osc.frequency.linearRampToValueAtTime(s.freq + s.slide, ctx.currentTime + s.dur);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + s.dur);
    osc.connect(g).connect(this.sfxGain);
    osc.start();
    osc.stop(ctx.currentTime + s.dur + 0.02);
  }

  playMusic(track: "menu" | "world") {
    const ctx = this.ensure();
    if (!ctx || !this.musicGain) return;
    if (this.currentName === track) return;
    this.stopMusic();
    this.currentName = track;
    // Pad harmonico suave e continuo (acorde diferente por trilha).
    const chords: Record<string, number[]> = {
      menu: [196.0, 261.63, 329.63], // G maior
      world: [174.61, 220.0, 293.66], // F/A
    };
    const gain = ctx.createGain();
    gain.gain.value = 1;
    gain.connect(this.musicGain);
    const osc = chords[track].map((f) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      const detune = ctx.createGain();
      detune.gain.value = 0.33;
      o.connect(detune).connect(gain);
      o.start();
      return o;
    });
    this.current = { osc, gain };
  }

  stopMusic() {
    if (this.current) {
      this.current.osc.forEach((o) => o.stop());
      this.current.gain.disconnect();
      this.current = null;
    }
    this.currentName = null;
  }
}

export const audio = new AudioEngine();
