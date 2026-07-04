/* ==============================================
   lv1.js — Lv1 新人（論理訓練所）
   ルール：
     「P → Q」と変形後の命題を見て、
     それが 逆・裏・対偶 のどれかを反射で答える。
     1問3秒。全20問。16問正解（80%）でクリア。
   ============================================== */

const LV1 = {
  TOTAL: 20,        // 問題数
  TIME_LIMIT: 3000, // 1問の制限時間（ミリ秒）
  CLEAR_LINE: 16,   // クリアに必要な正解数

  // 教官のセリフ
  LINES: {
    start:   ["まだ考えるな！反射で答えろ！", "3秒だ！見た瞬間に押せ！"],
    correct: ["いいぞ！", "その反射だ！", "悪くない！", "体が覚えてきたな！", "次だ！"],
    wrong:   ["考えすぎだ！形で覚えろ！", "矢印の向きを見ろ！", "¬が付くかどうかだ！", "次で取り返せ！"],
    timeout: ["遅い！3秒だぞ！", "迷うな！押せ！"],
  },
};

// プレイ中の状態（何問目か、正解数など）
let lv1 = {};

/* ゲーム開始 */
function startLv1() {
  lv1 = { num: 0, correct: 0, answered: false };

  // 回答ボタン（逆・裏・対偶）を作る ※反射練習なので位置は固定
  const box = $("#lv1-answers");
  box.innerHTML = "";
  KINDS.forEach((kind) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.textContent = kind;
    btn.onclick = () => lv1Answer(kind, btn);
    box.appendChild(btn);
  });

  $("#lv1-coach").textContent = pick(LV1.LINES.start);
  showScreen("screen-lv1");
  lv1Next();
}

/* 次の問題を出す */
function lv1Next() {
  lv1.num++;
  if (lv1.num > LV1.TOTAL) return lv1Finish();

  lv1.answered = false;
  lv1.pair = pick(SYMBOL_PAIRS);   // 使うアルファベット（P,Qなど）
  lv1.answer = pick(KINDS);        // 正解（逆・裏・対偶のどれか）

  // 画面に表示
  $("#lv1-progress").textContent = `${lv1.num} / ${LV1.TOTAL}`;
  $("#lv1-correct").textContent = `正解 ${lv1.correct}`;
  $("#lv1-original").textContent = symbolText(lv1.pair, "元");
  $("#lv1-target").textContent = symbolText(lv1.pair, lv1.answer);

  // ボタンの色をリセット
  document.querySelectorAll("#lv1-answers .answer-btn").forEach((b) => (b.className = "answer-btn"));

  // 制限時間スタート（時間切れ＝不正解扱い）
  runTimebar($("#lv1-timebar"), LV1.TIME_LIMIT);
  lv1.timer = later(() => lv1Timeout(), LV1.TIME_LIMIT);
}

/* 回答ボタンが押されたとき */
function lv1Answer(kind, btn) {
  if (lv1.answered) return; // 二度押し防止
  lv1.answered = true;
  clearTimeout(lv1.timer);
  stopTimebar($("#lv1-timebar"));

  const card = $("#lv1-card");
  if (kind === lv1.answer) {
    // 正解！
    lv1.correct++;
    Sound.play("correct");
    btn.classList.add("correct");
    card.classList.add("flash-correct");
    $("#lv1-coach").textContent = pick(LV1.LINES.correct);
  } else {
    // 不正解…
    Sound.play("wrong");
    btn.classList.add("wrong");
    card.classList.add("flash-wrong");
    $("#lv1-coach").textContent = `${pick(LV1.LINES.wrong)}（正解は「${lv1.answer}」）`;
  }

  // テンポ重視：少し待ってすぐ次の問題へ
  later(() => {
    card.classList.remove("flash-correct", "flash-wrong");
    lv1Next();
  }, 700);
}

/* 時間切れのとき */
function lv1Timeout() {
  if (lv1.answered) return;
  lv1.answered = true;
  Sound.play("wrong");
  $("#lv1-coach").textContent = `${pick(LV1.LINES.timeout)}（正解は「${lv1.answer}」）`;
  later(() => lv1Next(), 900);
}

/* 全問終了 → 結果画面 */
function lv1Finish() {
  const cleared = lv1.correct >= LV1.CLEAR_LINE;
  const rate = Math.round((lv1.correct / LV1.TOTAL) * 100);
  showResult({
    cleared,
    badge: cleared ? "🎖️" : "💦",
    title: cleared ? "訓練所 修了！" : "訓練継続！",
    lines: `正解数 <strong>${lv1.correct} / ${LV1.TOTAL}</strong>（正答率 ${rate}%）<br>` +
           (cleared
             ? "教官「見事だ！矢印道場へ行け！」"
             : `教官「クリアには ${LV1.CLEAR_LINE} 問正解が必要だ。もう一度！」`),
    bestText: `${lv1.correct}/${LV1.TOTAL}`,
  });
}
