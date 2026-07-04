/* ==============================================
   lv4.js — Lv4 対偶の達人（リズム修行）
   ルール：
     「P → Q」のカードが右から左へ流れてくる。
     指令（例「対偶！」）に合う数式を、カードが
     中央の判定ゾーンに入った瞬間にタップ！
       中央ど真ん中 → Perfect (300pt)
       ゾーン内     → Good (100pt)
       それ以外／間違い → Miss
     全20ノーツ。3000pt以上でクリア。
   ============================================== */

const LV4 = {
  TOTAL: 20,
  NOTE_TIME: 4800,    // カードが右端から左端まで流れる時間（ミリ秒）
  CLEAR_SCORE: 2000,
  PERFECT_RANGE: 0.12, // 中央からのズレがレーン幅の12%以内 → Perfect
  GOOD_RANGE: 0.25,    // 25%以内 → Good（判定ゾーンの見た目と一致）
};

let lv4 = {};

/* ゲーム開始 */
function startLv4() {
  lv4 = {
    num: 0, score: 0, combo: 0, maxCombo: 0,
    perfect: 0, good: 0, miss: 0,
    running: false,   // アニメーションループ中かどうか
    judged: false,    // 今のノーツを判定済みか
  };
  $("#lv4-judge").textContent = "";
  showScreen("screen-lv4");
  later(() => lv4Next(), 600); // 少し間を置いてスタート
}

/* 途中でやめるとき用：アニメーションを止める */
function stopLv4() {
  lv4.running = false;
}

/* スマホでアプリを切り替えて戻ってきたとき、
   経過時間が一気に進んで即Missになるのを防ぐ：
   今のノーツを最初から流し直す */
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && lv4.running && !lv4.judged) {
    lv4.startTime = performance.now();
  }
});

/* 次のノーツを流す */
function lv4Next() {
  lv4.num++;
  if (lv4.num > LV4.TOTAL) return lv4Finish();

  lv4.judged = false;
  lv4.pair = pick(SYMBOL_PAIRS);
  lv4.answer = pick(KINDS); // 指令（対偶！など）

  // 画面表示
  $("#lv4-progress").textContent = `${lv4.num} / ${LV4.TOTAL}`;
  $("#lv4-score").textContent = `${lv4.score} pt`;
  lv4UpdateCombo();
  $("#lv4-command").textContent = lv4.answer + "！";

  // 回答ボタン（3つの数式をシャッフル）
  const box = $("#lv4-answers");
  box.innerHTML = "";
  shuffle(KINDS).forEach((kind) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.textContent = symbolText(lv4.pair, kind);
    btn.onclick = () => lv4Judge(kind, btn);
    box.appendChild(btn);
  });

  // ノーツ（カード）を右端にセットして流し始める
  const note = $("#lv4-note");
  note.textContent = symbolText(lv4.pair, "元");
  lv4.startTime = performance.now();
  lv4.running = true;
  requestAnimationFrame(lv4Flow);
}

/* カードを右から左へ動かすアニメーションループ */
function lv4Flow(now) {
  if (!lv4.running) return;

  const lane = $("#lv4-lane");
  const note = $("#lv4-note");
  const progress = (now - lv4.startTime) / LV4.NOTE_TIME; // 0→1 で右端→左端

  // カードの位置を計算（右端の外 → 左端の外へ）
  const laneW = lane.clientWidth;
  const noteW = note.clientWidth;
  const x = laneW - progress * (laneW + noteW);
  note.style.left = x + "px";

  if (progress >= 1) {
    // 最後まで流れてしまった → Miss
    if (!lv4.judged) lv4Result("miss", "スルー…");
    return;
  }
  requestAnimationFrame(lv4Flow);
}

/* ボタンが押されたときの判定 */
function lv4Judge(kind, btn) {
  if (lv4.judged || !lv4.running) return;

  const lane = $("#lv4-lane");
  const note = $("#lv4-note");

  // カードの中心と判定ゾーン中心（レーン中央）のズレを 0〜1 で計算
  const laneRect = lane.getBoundingClientRect();
  const noteRect = note.getBoundingClientRect();
  const laneCenter = laneRect.left + laneRect.width / 2;
  const noteCenter = noteRect.left + noteRect.width / 2;
  const diff = Math.abs(noteCenter - laneCenter) / laneRect.width;

  if (kind !== lv4.answer) {
    // 数式そのものが間違い
    btn.classList.add("wrong");
    lv4Result("miss", "Miss（式が違う！）");
  } else if (diff <= LV4.PERFECT_RANGE) {
    btn.classList.add("correct");
    lv4Result("perfect", "Perfect!!");
  } else if (diff <= LV4.GOOD_RANGE) {
    btn.classList.add("correct");
    lv4Result("good", "Good!");
  } else {
    // 式は合っているがタイミングが外れている
    lv4Result("miss", noteCenter > laneCenter ? "Miss（早い！）" : "Miss（遅い！）");
  }
}

/* 判定結果を反映して次のノーツへ */
function lv4Result(type, text) {
  lv4.judged = true;
  lv4.running = false;

  const judge = $("#lv4-judge");
  judge.textContent = text;
  judge.className = "judge-text " + type;

  if (type === "perfect") {
    lv4.perfect++;
    lv4.combo++;
    lv4.score += 300;
    Sound.play("perfect");
  } else if (type === "good") {
    lv4.good++;
    lv4.combo++;
    lv4.score += 100;
    Sound.play("correct");
  } else {
    lv4.miss++;
    lv4.combo = 0;
    Sound.play("wrong");
  }
  lv4.maxCombo = Math.max(lv4.maxCombo, lv4.combo);
  $("#lv4-score").textContent = `${lv4.score} pt`;
  lv4UpdateCombo();

  later(() => lv4Next(), 500); // テンポよく次のノーツへ
}

/* コンボ表示 */
function lv4UpdateCombo() {
  const el = $("#lv4-combo");
  el.textContent = lv4.combo >= 2 ? `🔥${lv4.combo} COMBO` : "";
  el.classList.remove("pop");
  void el.offsetWidth;
  el.classList.add("pop");
}

/* 終了 → 結果画面 */
function lv4Finish() {
  lv4.running = false;
  const cleared = lv4.score >= LV4.CLEAR_SCORE;
  showResult({
    cleared,
    badge: cleared ? "🥁" : "💦",
    title: cleared ? "対偶の達人 認定！" : "修行やり直し！",
    lines: `スコア <strong>${lv4.score} pt</strong><br>` +
           `Perfect ${lv4.perfect} ／ Good ${lv4.good} ／ Miss ${lv4.miss}<br>最大コンボ 🔥${lv4.maxCombo}<br>` +
           (cleared
             ? "「リズムと論理が一つになった…！最後の相手が待っているぞ」"
             : `「クリアには ${LV4.CLEAR_SCORE} pt 必要だ。リズムに乗れ！」`),
    bestText: `${lv4.score}pt`,
  });
}
