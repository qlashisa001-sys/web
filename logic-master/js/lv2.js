/* ==============================================
   lv2.js — Lv2 見習い（矢印道場）
   ルール：
     師範が「逆！」「裏！」「対偶！」と叫ぶので、
     その形の命題（数式）を3つの中から瞬時にタップする。
     Lv1の「逆方向」の練習。コンボと正答率を表示。
     1問4秒。全20問。正答率80%でクリア。
   ============================================== */

const LV2 = {
  TOTAL: 20,
  TIME_LIMIT: 4000,
  CLEAR_RATE: 80, // クリアに必要な正答率(%)
};

let lv2 = {};

/* ゲーム開始 */
function startLv2() {
  lv2 = { num: 0, correct: 0, combo: 0, maxCombo: 0, answered: false };
  showScreen("screen-lv2");
  lv2Next();
}

/* 次の問題を出す */
function lv2Next() {
  lv2.num++;
  if (lv2.num > LV2.TOTAL) return lv2Finish();

  lv2.answered = false;
  lv2.pair = pick(SYMBOL_PAIRS);
  lv2.answer = pick(KINDS); // 師範が叫ぶ言葉＝正解の変形

  // 画面表示：師範の叫び＋元の命題
  $("#lv2-progress").textContent = `${lv2.num} / ${LV2.TOTAL}`;
  lv2UpdateHud();
  $("#lv2-original").textContent = symbolText(lv2.pair, "元");

  // 叫びの吹き出しをアニメーションし直す（一度クラスを外して付け直す）
  const shout = $("#lv2-shout");
  shout.classList.remove("shout");
  void shout.offsetWidth;
  shout.classList.add("shout");
  shout.textContent = lv2.answer + "！";

  // 選択肢：逆・裏・対偶の3つの数式をシャッフルして並べる
  const box = $("#lv2-answers");
  box.innerHTML = "";
  shuffle(KINDS).forEach((kind) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.textContent = symbolText(lv2.pair, kind);
    btn.onclick = () => lv2Answer(kind, btn);
    box.appendChild(btn);
  });

  runTimebar($("#lv2-timebar"), LV2.TIME_LIMIT);
  lv2.timer = later(() => lv2Timeout(), LV2.TIME_LIMIT);
}

/* コンボと正答率の表示を更新する */
function lv2UpdateHud() {
  const comboEl = $("#lv2-combo");
  comboEl.textContent = lv2.combo >= 2 ? `🔥${lv2.combo} COMBO` : "";
  comboEl.classList.remove("pop");
  void comboEl.offsetWidth;
  comboEl.classList.add("pop");

  const done = lv2.num - 1; // 回答済みの問題数
  const rate = done > 0 ? Math.round((lv2.correct / done) * 100) : "--";
  $("#lv2-acc").textContent = `正答率 ${rate}%`;
}

/* 回答 */
function lv2Answer(kind, btn) {
  if (lv2.answered) return;
  lv2.answered = true;
  clearTimeout(lv2.timer);
  stopTimebar($("#lv2-timebar"));

  const card = $("#lv2-card");
  if (kind === lv2.answer) {
    lv2.correct++;
    lv2.combo++;
    lv2.maxCombo = Math.max(lv2.maxCombo, lv2.combo);
    Sound.play(lv2.combo >= 5 ? "combo" : "correct");
    btn.classList.add("correct");
    card.classList.add("flash-correct");
  } else {
    lv2.combo = 0; // コンボが途切れる
    Sound.play("wrong");
    btn.classList.add("wrong");
    card.classList.add("flash-wrong");
    // 正解のボタンを光らせて教える
    document.querySelectorAll("#lv2-answers .answer-btn").forEach((b) => {
      if (b.textContent === symbolText(lv2.pair, lv2.answer)) b.classList.add("correct");
    });
  }

  later(() => {
    card.classList.remove("flash-correct", "flash-wrong");
    lv2Next();
  }, 700);
}

/* 時間切れ */
function lv2Timeout() {
  if (lv2.answered) return;
  lv2.answered = true;
  lv2.combo = 0;
  Sound.play("wrong");
  $("#lv2-shout").textContent = "遅い！";
  later(() => lv2Next(), 800);
}

/* 終了 → 結果画面 */
function lv2Finish() {
  const rate = Math.round((lv2.correct / LV2.TOTAL) * 100);
  const cleared = rate >= LV2.CLEAR_RATE;
  showResult({
    cleared,
    badge: cleared ? "🥋" : "💦",
    title: cleared ? "道場 免許皆伝！" : "修行が足りぬ！",
    lines: `正答率 <strong>${rate}%</strong>（${lv2.correct} / ${LV2.TOTAL}）<br>最大コンボ 🔥${lv2.maxCombo}<br>` +
           (cleared
             ? "師範「見事！次は事件が待っておる」"
             : `師範「正答率 ${LV2.CLEAR_RATE}% でクリアじゃ。出直してまいれ！」`),
    bestText: `${rate}%`,
  });
}
