import { audioFile } from '../assets/registry';
import { BIRTHDAY, BIRTHDAY_JINGLE, CHIPTUNE, noteFreq, songBeats, type Song, type Voice } from './songs';
import type { Track } from '../store/useGame';

export type SfxName = 'click' | 'place' | 'pick' | 'drop' | 'capture' | 'win' | 'error' | 'undo' | 'reseed' | 'hover';

const SONGS: Record<Exclude<Track, 'off'>, Song> = { chiptune: CHIPTUNE, birthday: BIRTHDAY };
const LOOKAHEAD = 0.15; // giây lên lịch trước
const TICK_MS = 25;

interface VoiceCursor {
  voice: Voice;
  index: number;
  time: number;
  loop: number;
}

/**
 * Âm thanh của game: ưu tiên file mp3/ogg trong src/assets/audio (đặt đúng tên trong
 * asset-prompts/06-audio-sources.md), nếu không có thì tự tổng hợp nhạc và SFX 8-bit.
 */
class AudioEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicBus!: GainNode;
  private sfxBus!: GainNode;
  private noise!: AudioBuffer;

  private musicVol = 0.5;
  private sfxVol = 0.8;
  private muted = false;

  private track: Track = 'off';
  private timer: number | null = null;
  private cursors: VoiceCursor[] = [];
  private songStart = 0;
  private loopLen = 0;
  private song: Song | null = null;
  private musicEl: HTMLAudioElement | null = null;
  private duckUntil = 0;

  /** Phải gọi trong một thao tác của người dùng (click) do chính sách autoplay của trình duyệt. */
  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.connect(this.ctx.destination);
      this.musicBus = this.ctx.createGain();
      this.musicBus.connect(this.master);
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.connect(this.master);
      const len = this.ctx.sampleRate * 0.5;
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.applyVolumes();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    if (this.track !== 'off' && !this.timer && !this.musicEl) this.startTrack(this.track);
  }

  setVolumes(music: number, sfx: number, muted: boolean) {
    this.musicVol = music;
    this.sfxVol = sfx;
    this.muted = muted;
    this.applyVolumes();
  }

  private applyVolumes() {
    const music = this.ducked() ? this.musicVol * 0.15 : this.musicVol;
    if (this.musicEl) this.musicEl.volume = this.muted ? 0 : music;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(this.muted ? 0 : 1, t, 0.05);
    this.musicBus.gain.setTargetAtTime(music, t, 0.08);
    this.sfxBus.gain.setTargetAtTime(this.sfxVol, t, 0.02);
  }

  private ducked() {
    return this.ctx ? this.ctx.currentTime < this.duckUntil : false;
  }

  playMusic(track: Track) {
    if (track === this.track && (this.timer || this.musicEl)) return;
    this.stopMusic();
    this.track = track;
    if (track !== 'off' && this.ctx) this.startTrack(track);
  }

  private startTrack(track: Exclude<Track, 'off'>) {
    const file = audioFile(`bgm-${track}`);
    if (file) {
      const el = new Audio(file);
      el.loop = true;
      el.volume = this.muted ? 0 : this.musicVol;
      void el.play().catch(() => undefined);
      this.musicEl = el;
      return;
    }
    if (!this.ctx) return;
    this.song = SONGS[track];
    this.loopLen = (songBeats(this.song) * 60) / this.song.bpm;
    this.songStart = this.ctx.currentTime + 0.1;
    this.cursors = this.song.voices.map((voice) => ({ voice, index: 0, time: this.songStart, loop: 0 }));
    this.timer = window.setInterval(() => this.schedule(), TICK_MS);
    this.schedule();
  }

  private stopMusic() {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    this.song = null;
    if (this.musicEl) {
      this.musicEl.pause();
      this.musicEl = null;
    }
  }

  private schedule() {
    if (!this.ctx || !this.song) return;
    const now = this.ctx.currentTime;
    const horizon = now + LOOKAHEAD;
    const beat = 60 / this.song.bpm;
    for (const c of this.cursors) {
      // Tab bị ẩn lâu → nhảy tới vòng lặp hiện tại thay vì phát dồn
      if (c.time < now - 0.5) {
        c.loop = Math.ceil((now - this.songStart) / this.loopLen);
        c.index = 0;
        c.time = this.songStart + c.loop * this.loopLen;
      }
      while (c.time < horizon) {
        if (c.index >= c.voice.notes.length) {
          // giọng này hết nốt → chờ vòng lặp kế tiếp, nhờ vậy các giọng luôn khớp nhịp
          c.loop += 1;
          c.index = 0;
          c.time = this.songStart + c.loop * this.loopLen;
          continue;
        }
        const [note, beats] = c.voice.notes[c.index];
        const dur = beats * beat;
        if (note) this.tone(this.musicBus, c.voice.wave, note, c.time, dur * (c.voice.legato ?? 0.9), c.voice.gain);
        c.time += dur;
        c.index += 1;
      }
    }
  }

  /** Hạ nhỏ nhạc nền trong `seconds` giây (khi phát nhạc thắng). */
  private duck(seconds: number) {
    if (!this.ctx) return;
    this.duckUntil = this.ctx.currentTime + seconds;
    this.applyVolumes();
    window.setTimeout(() => this.applyVolumes(), seconds * 1000 + 50);
  }

  private tone(bus: AudioNode, wave: Voice['wave'], note: string, t: number, dur: number, gain: number, slideTo?: number) {
    const ctx = this.ctx!;
    const env = ctx.createGain();
    env.connect(bus);
    const peak = Math.max(gain, 0.0001);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(peak, t + 0.008);
    env.gain.setValueAtTime(peak, t + Math.max(0.01, dur * 0.6));
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    if (wave === 'noise') {
      const src = ctx.createBufferSource();
      src.buffer = this.noise;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 6000;
      src.connect(hp).connect(env);
      src.start(t);
      src.stop(t + dur + 0.02);
      return;
    }
    const osc = ctx.createOscillator();
    osc.type = wave;
    const f = note.startsWith('#') ? Number(note.slice(1)) : noteFreq(note);
    osc.frequency.setValueAtTime(f, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    osc.connect(env);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  /** Phát một đoạn nhạc ngắn (không lặp) chồng lên nhạc nền, nhạc nền được hạ nhỏ trong lúc đó. */
  private playOnce(song: Song) {
    if (!this.ctx) return;
    const beat = 60 / song.bpm;
    const start = this.ctx.currentTime + 0.05;
    for (const v of song.voices) {
      let t = start;
      for (const [note, beats] of v.notes) {
        if (note) this.tone(this.sfxBus, v.wave, note, t, beats * beat * (v.legato ?? 0.9), v.gain);
        t += beats * beat;
      }
    }
    this.duck(songBeats(song) * beat + 0.3);
  }

  sfx(name: SfxName) {
    if (!this.ctx || this.muted) return;
    const file = audioFile(`sfx-${name}`);
    if (file) {
      const el = new Audio(file);
      el.volume = this.sfxVol;
      void el.play().catch(() => undefined);
      if (name === 'win') this.duck(4);
      return;
    }
    const t = this.ctx.currentTime + 0.005;
    const b = this.sfxBus;
    const hz = (f: number) => `#${f}`;
    switch (name) {
      case 'hover':
        this.tone(b, 'sine', hz(1400), t, 0.04, 0.05);
        break;
      case 'click':
        this.tone(b, 'square', hz(660), t, 0.05, 0.12, 990);
        break;
      case 'place':
        this.tone(b, 'sine', hz(280), t, 0.16, 0.45, 760);
        this.tone(b, 'triangle', hz(560), t + 0.02, 0.1, 0.18, 1200);
        break;
      case 'pick':
        this.tone(b, 'triangle', hz(420), t, 0.1, 0.3, 880);
        break;
      case 'drop':
        this.tone(b, 'sine', hz(1250 + Math.random() * 300), t, 0.06, 0.32, 600);
        this.tone(b, 'noise', 'x', t, 0.025, 0.08);
        break;
      case 'capture':
        ['C6', 'E6', 'G6', 'C7'].forEach((n, i) => this.tone(b, 'square', n, t + i * 0.06, 0.09, 0.12));
        break;
      case 'reseed':
        ['G5', 'B5', 'D6', 'G6', 'B6'].forEach((n, i) => this.tone(b, 'triangle', n, t + i * 0.05, 0.12, 0.2));
        break;
      case 'undo':
        this.tone(b, 'triangle', hz(900), t, 0.14, 0.25, 320);
        break;
      case 'error':
        this.tone(b, 'square', hz(180), t, 0.09, 0.12);
        this.tone(b, 'square', hz(150), t + 0.1, 0.12, 0.12);
        break;
      case 'win':
        this.playOnce(BIRTHDAY_JINGLE);
        break;
    }
  }
}

export const audio = new AudioEngine();
