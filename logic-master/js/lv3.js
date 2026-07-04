/* ==============================================
   lv3.js — Lv3 命題探偵
   ルール：
     日本語の命題（questions.js のデータ）を使った事件ファイル形式。
     「元の命題」と「現場に残された命題」を見比べて、
     犯人（逆・裏・対偶のどれか）を A/B/C から選ぶ。
     正解すると探偵メイダイが論理ボールを犯人へ蹴る！
     全10事件。8件解決でクリア。制限時間なし（じっくり考えるレベル）。

   ★問題を増やしたいときは questions.js の PROPOSITIONS に
     追加するだけでOK（100事件でも対応できます）。
   ============================================== */

const LV3 = {
  TOTAL: 10,      // 1プレイの事件数
  CLEAR_LINE: 8,  // クリアに必要な解決数

  LINES: {
    start:   ["この事件、論理で解いてみせよう。", "犯人は3つの変形のどれかだ。", "証言をよく見ろ…矢印と否定がヒントだ。"],
    correct: ["そこだ！", "犯人はお前だ！", "論理は嘘をつかない。", "事件解決！"],
    wrong:   ["論理が甘い。", "それは無実の変形だ…。", "落ち着いて、否定と向きを見るんだ。"],
  },
};

let lv3 = {};

/* ゲーム開始 */
function startLv3() {
  lv3 = {
    num: 0,
    solved: 0,
    answered: false,
    // 命題データをシャッフルして今回の10事件を決める
    cases: shuffle(PROPOSITIONS).slice(0, LV3.TOTAL),
  };
  $("#lv3-line").textContent = pick(LV3.LINES.start);
  showScreen("screen-lv3");
  lv3Next();
}

/* 次の事件を出す */
function lv3Next() {
  lv3.num++;
  if (lv3.num > LV3.TOTAL) return lv3Finish();

  lv3.answered = false;
  lv3.prop = lv3.cases[lv3.num - 1];
  lv3.answer = pick(KINDS); // 犯人（＝残された命題がどの変形か）

  // 事件ファイルを表示
  $("#lv3-progress").textContent = `事件 ${lv3.num} / ${LV3.TOTAL}`;
  $("#lv3-solved").textContent = `解決 ${lv3.solved}`;
  $("#lv3-caseno").textContent = `事件 No.${Math.floor(Math.random() * 90) + 10}`; // 雰囲気用のランダム番号
  $("#lv3-original").textContent = propText(lv3.prop, "元");
  $("#lv3-suspect").textContent = propText(lv3.prop, lv3.answer);

  // 容疑者ボタン A/B/C（順番は固定：覚えやすさ優先）
  const labels = ["A", "B", "C"];
  const box = $("#lv3-answers");
  box.innerHTML = "";
  KINDS.forEach((kind, i) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.textContent = `${labels[i]}　${kind}`;
    btn.onclick = () => lv3Answer(kind, btn);
    box.appendChild(btn);
  });
}

/* 回答 */
function lv3Answer(kind, btn) {
  if (lv3.answered) return;
  lv3.answered = true;

  const card = $("#lv3-card");
  if (kind === lv3.answer) {
    // 正解！探偵が論理ボールを蹴る演出
    lv3.solved++;
    Sound.play("kick");
    btn.classList.add("correct");
    card.classList.add("flash-correct");
    $("#lv3-line").textContent = pick(LV3.LINES.correct);

    // ボールのアニメーション（CSSの .kick を付け直す）
    const ball = $("#lv3-ball");
    ball.classList.remove("kick");
    void ball.offsetWidth;
    ball.classList.add("kick");
  } else {
    Sound.play("wrong");
    btn.classList.add("wrong");
    card.classList.add("flash-wrong");
    $("#lv3-line").textContent = `${pick(LV3.LINES.wrong)}（犯人は「${lv3.answer}」だった）`;
  }

  // 探偵レベルは少しゆっくりめに次へ
  later(() => {
    card.classList.remove("flash-correct", "flash-wrong");
    lv3Next();
  }, 1200);
}

/* 終了 → 結果画面 */
function lv3Finish() {
  const cleared = lv3.solved >= LV3.CLEAR_LINE;
  showResult({
    cleared,
    badge: cleared ? "🕵️" : "📁",
    title: cleared ? "全事件ファイル完了！" : "迷宮入り…",
    lines: `解決 <strong>${lv3.solved} / ${LV3.TOTAL}</strong> 事件<br>` +
           (cleared
             ? "メイダイ「見事な推理だ。次はリズム修行が待っている」"
             : `メイダイ「${LV3.CLEAR_LINE} 件解決でクリアだ。もう一度挑むぞ」`),
    bestText: `${lv3.solved}/${LV3.TOTAL}事件`,
  });
}
