/* ==============================================
   lv5.js — Lv5 論理王（論理バトル）
   ルール：
     オリジナル論客「ロンパ卿」とのバトル。
     正解するとロンパ卿にダメージ（HP7）、
     間違い・時間切れだと自分がダメージ（HP3）。
     1問8秒。考えていると挑発される。
     問題は Lv1〜Lv3 の全形式からランダム出題。
     ロンパ卿を倒せば「論理王」の称号！
   ============================================== */

const LV5 = {
  PLAYER_HP: 3,
  ENEMY_HP: 7,
  TIME_LIMIT: 8000,

  // 挑発セリフ（ユーモラスに、不快になりすぎない範囲で）
  TAUNTS: [
    "まだですか？",
    "考え込んでますね。",
    "逆と対偶、混ざってません？",
    "焦ってませんか？",
    "その程度ですか？",
    "私なら0.2秒で答えてますね。",
    "お茶でも淹れて待ちましょうか。",
    "¬（否定）を見落とすタイプでしょう？",
    "チクタク、チクタク…。",
    "ふむ、良い顔で悩みますね。",
  ],
  HIT_LINES:  ["ぐぬぬ…！", "な、なかなかやりますね…", "今のはまぐれでしょう？", "私のHPが…！"],
  GLOAT_LINES: ["ふっふっふ、いただきました。", "論理の道は険しいですねぇ。", "おやおや、それでは私に勝てませんよ？"],
};

let lv5 = {};

/* ゲーム開始 */
function startLv5() {
  lv5 = { playerHP: LV5.PLAYER_HP, enemyHP: LV5.ENEMY_HP, answered: false, tauntTimer: null };
  $("#lv5-taunt").textContent = "ようこそ。私が論客ロンパ卿。あなたを論破して差し上げましょう。";
  lv5UpdateHp();
  showScreen("screen-lv5");
  later(() => lv5Next(), 1200);
}

/* HP表示（ハートと帽子で表す） */
function lv5UpdateHp() {
  $("#lv5-php").textContent = "❤️".repeat(lv5.playerHP) + "🖤".repeat(LV5.PLAYER_HP - lv5.playerHP);
  $("#lv5-ehp").textContent = "🎩".repeat(lv5.enemyHP) + "・".repeat(LV5.ENEMY_HP - lv5.enemyHP);
}

/* 次の問題を出す（3形式からランダム） */
function lv5Next() {
  if (lv5.enemyHP <= 0 || lv5.playerHP <= 0) return lv5Finish();

  lv5.answered = false;
  const type = pick(["nameQuiz", "formulaQuiz", "propQuiz"]);
  lv5.answer = pick(KINDS);
  const box = $("#lv5-answers");
  box.innerHTML = "";

  if (type === "nameQuiz") {
    // 形式1（Lv1型）：記号の変形を見て名前を答える
    const pair = pick(SYMBOL_PAIRS);
    $("#lv5-label").textContent = "この変形の名前は？";
    $("#lv5-original").textContent = "元：" + symbolText(pair, "元");
    $("#lv5-target").textContent = symbolText(pair, lv5.answer);
    KINDS.forEach((kind) => box.appendChild(lv5MakeBtn(kind, kind)));

  } else if (type === "formulaQuiz") {
    // 形式2（Lv2型）：名前を見て正しい数式を選ぶ
    const pair = pick(SYMBOL_PAIRS);
    lv5.correctText = symbolText(pair, lv5.answer);
    $("#lv5-label").textContent = `「${symbolText(pair, "元")}」の ${lv5.answer} はどれ？`;
    $("#lv5-original").textContent = "";
    $("#lv5-target").textContent = "";
    shuffle(KINDS).forEach((kind) =>
      box.appendChild(lv5MakeBtn(symbolText(pair, kind), kind))
    );

  } else {
    // 形式3（Lv3型）：日本語の命題の変形を見て名前を答える
    const prop = pick(PROPOSITIONS);
    $("#lv5-label").textContent = "この変形の名前は？";
    $("#lv5-original").textContent = "元：" + propText(prop, "元");
    $("#lv5-target").textContent = propText(prop, lv5.answer);
    KINDS.forEach((kind) => box.appendChild(lv5MakeBtn(kind, kind)));
  }

  // 制限時間スタート
  runTimebar($("#lv5-timebar"), LV5.TIME_LIMIT);
  lv5.timer = later(() => lv5Timeout(), LV5.TIME_LIMIT);

  // 挑発タイマー：2.5〜4.5秒おきにランダムなセリフ
  lv5ScheduleTaunt();
}

/* 回答ボタンを1つ作る（label: 表示文字, kind: 選んだ変形） */
function lv5MakeBtn(label, kind) {
  const btn = document.createElement("button");
  btn.className = "answer-btn";
  btn.textContent = label;
  btn.onclick = () => lv5Answer(kind, btn);
  return btn;
}

/* 挑発セリフを予約する */
function lv5ScheduleTaunt() {
  clearTimeout(lv5.tauntTimer);
  lv5.tauntTimer = later(() => {
    if (lv5.answered) return;
    $("#lv5-taunt").textContent = pick(LV5.TAUNTS);
    lv5ScheduleTaunt(); // 次の挑発も予約
  }, 2500 + Math.random() * 2000);
}

/* 回答 */
function lv5Answer(kind, btn) {
  if (lv5.answered) return;
  lv5.answered = true;
  clearTimeout(lv5.timer);
  clearTimeout(lv5.tauntTimer);
  stopTimebar($("#lv5-timebar"));

  const enemy = $("#lv5-enemy");
  if (kind === lv5.answer) {
    // 正解 → ロンパ卿にダメージ！
    lv5.enemyHP--;
    Sound.play("damage");
    btn.classList.add("correct");
    enemy.classList.remove("hit");
    void enemy.offsetWidth;
    enemy.classList.add("hit");
    $("#lv5-taunt").textContent = pick(LV5.HIT_LINES);
  } else {
    // 不正解 → 自分がダメージ…
    lv5.playerHP--;
    Sound.play("wrong");
    btn.classList.add("wrong");
    $("#lv5-taunt").textContent = `${pick(LV5.GLOAT_LINES)}（正解は「${lv5.answer}」）`;
  }

  lv5UpdateHp();
  later(() => lv5Next(), 1100);
}

/* 時間切れ → 自分がダメージ */
function lv5Timeout() {
  if (lv5.answered) return;
  lv5.answered = true;
  clearTimeout(lv5.tauntTimer);
  lv5.playerHP--;
  Sound.play("wrong");
  $("#lv5-taunt").textContent = `時間切れです。（正解は「${lv5.answer}」でした）`;
  lv5UpdateHp();
  later(() => lv5Next(), 1100);
}

/* 終了 → 結果画面 */
function lv5Finish() {
  const cleared = lv5.enemyHP <= 0;
  showResult({
    cleared,
    badge: cleared ? "👑" : "🎩",
    title: cleared ? "論理王 誕生！！" : "ロンパ卿の勝利…",
    lines: cleared
      ? `ロンパ卿「完敗です…あなたこそ真の<strong>論理王</strong>だ」<br>全レベル制覇おめでとう！🎉<br>逆・裏・対偶はもう君のものだ。`
      : `ロンパ卿「ふっふっふ、また挑戦してくださいね」<br>残りHP：ロンパ卿 ${lv5.enemyHP}<br>あと少し！落ち着いて否定と向きを見よう。`,
    bestText: cleared ? "👑撃破" : "",
  });
}
