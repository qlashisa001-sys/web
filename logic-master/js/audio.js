/* ==============================================
   audio.js — 効果音
   今は Web Audio API で「ピコッ」という電子音を
   その場で合成しています（音声ファイル不要）。

   ★あとで本物の効果音（mp3など）に差し替えたい場合：
   Sound.play() の中身を
     new Audio("sounds/correct.mp3").play();
   のように書き換えるだけでOKです。
   ============================================== */

const Sound = {
  enabled: true,   // 効果音のON/OFF（タイトル画面で切り替え）
  ctx: null,       // AudioContext（最初の操作時に作る）

  // AudioContext はユーザーの操作後でないと作れないので、ここで用意する
  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
  },

  // 1つの「ピッ」という音を鳴らす基本の関数
  // freq: 音の高さ(Hz) / dur: 長さ(秒) / type: 波形 / delay: 何秒後に鳴らすか
  beep(freq, dur, type = "square", delay = 0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur); // だんだん小さく
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  },

  // ゲーム中はこの play("名前") だけを呼ぶ
  play(name) {
    if (!this.enabled) return;
    switch (name) {
      case "tap":     this.beep(600, 0.05); break;                       // ボタンタップ
      case "correct": this.beep(880, 0.08); this.beep(1320, 0.15, "square", 0.08); break; // 正解
      case "wrong":   this.beep(160, 0.25, "sawtooth"); break;           // 不正解
      case "perfect": this.beep(1046, 0.06); this.beep(1318, 0.06, "square", 0.06); this.beep(1568, 0.2, "square", 0.12); break;
      case "combo":   this.beep(1568, 0.08, "triangle"); break;          // コンボ
      case "kick":    this.beep(220, 0.1, "triangle"); this.beep(440, 0.15, "triangle", 0.08); break; // 論理ボール
      case "damage":  this.beep(120, 0.3, "sawtooth"); break;            // ダメージ
      case "clear":   [523, 659, 784, 1046].forEach((f, i) => this.beep(f, 0.18, "square", i * 0.12)); break; // クリア
      case "fail":    [400, 300, 200].forEach((f, i) => this.beep(f, 0.2, "sawtooth", i * 0.15)); break;      // 失敗
    }
  },
};
