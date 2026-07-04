/* ==============================================
   main.js — 画面切り替え・共通処理
   ゲーム全体の「土台」となるファイルです。
   - 便利関数（シャッフルなど）
   - 命題を「逆・裏・対偶」に変形する関数
   - 画面の切り替え
   - レベル選択画面
   - 結果画面（全レベル共通）
   ============================================== */

/* ---------- 便利関数 ---------- */

// document.querySelector の短縮形
const $ = (sel) => document.querySelector(sel);

// 配列をシャッフルした新しい配列を返す
function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 配列からランダムに1つ選ぶ
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// setTimeout の管理付き版。画面を離れるときに全部キャンセルできる
let activeTimers = [];
function later(fn, ms) {
  const id = setTimeout(fn, ms);
  activeTimers.push(id);
  return id;
}
function clearAllTimers() {
  activeTimers.forEach((id) => clearTimeout(id));
  activeTimers = [];
}

/* ---------- 逆・裏・対偶の変形ルール（ゲームの心臓部） ---------- */

const KINDS = ["逆", "裏", "対偶"];

// 記号の命題（P → Q など）を変形して文字列にする
function symbolText(pair, kind) {
  const [p, q] = pair;
  switch (kind) {
    case "元":   return `${p} → ${q}`;
    case "逆":   return `${q} → ${p}`;
    case "裏":   return `¬${p} → ¬${q}`;
    case "対偶": return `¬${q} → ¬${p}`;
  }
}

// 日本語の命題（x=2 ならば x²=4 など）を変形して文字列にする
function propText(prop, kind) {
  switch (kind) {
    case "元":   return `${prop.p} ならば ${prop.q}`;
    case "逆":   return `${prop.q} ならば ${prop.p}`;
    case "裏":   return `${prop.np} ならば ${prop.nq}`;
    case "対偶": return `${prop.nq} ならば ${prop.np}`;
  }
}

/* ---------- 制限時間バー ---------- */

// バーを ms ミリ秒かけて 100%→0% に縮めるアニメーションを開始する
function runTimebar(el, ms) {
  el.style.transition = "none";
  el.style.width = "100%";
  void el.offsetWidth; // いったん反映させる（CSSの再描画テクニック）
  el.style.transition = `width ${ms}ms linear`;
  el.style.width = "0%";
}
function stopTimebar(el) {
  el.style.transition = "none";
  el.style.width = "100%";
}

/* ---------- 画面切り替え ---------- */

function showScreen(id) {
  clearAllTimers(); // 前の画面のタイマーを全部止める（バグ防止）
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $("#" + id).classList.add("active");
  window.scrollTo(0, 0);
}

/* ---------- レベルの定義 ---------- */

const LEVELS = [
  { id: 1, name: "Lv1 新人",       icon: "🎖️", desc: "論理訓練所｜反射で答えろ！全20問",   start: () => startLv1() },
  { id: 2, name: "Lv2 見習い",     icon: "🥋", desc: "矢印道場｜師範の叫びに即対応",       start: () => startLv2() },
  { id: 3, name: "Lv3 命題探偵",   icon: "🕵️", desc: "命題事件を解決せよ｜全10事件",       start: () => startLv3() },
  { id: 4, name: "Lv4 対偶の達人", icon: "🥁", desc: "リズム修行｜タイミングよく答えろ",   start: () => startLv4() },
  { id: 5, name: "Lv5 論理王",     icon: "👑", desc: "論客ロンパ卿との最終バトル",         start: () => startLv5() },
];

// 直近にプレイしたレベル（結果画面の「もう一度」用）
let currentLevel = null;

/* ---------- レベル選択画面を組み立てる ---------- */

function renderLevelSelect() {
  const list = $("#level-list");
  list.innerHTML = "";

  LEVELS.forEach((lv) => {
    const unlocked = lv.id <= saveData.unlocked;
    const cleared = !!saveData.best[lv.id];

    const card = document.createElement("button");
    card.className = "level-card" + (cleared ? " cleared" : "") + (unlocked ? "" : " locked");
    card.innerHTML = `
      <span class="lv-icon">${unlocked ? lv.icon : "🔒"}</span>
      <span>
        <span class="lv-name">${lv.name}</span>
        <div class="lv-desc">${lv.desc}</div>
      </span>
      <span class="lv-status">${cleared ? "✅ クリア<br>" + saveData.best[lv.id] : unlocked ? "挑戦できる" : "ロック中"}</span>
    `;

    if (unlocked) {
      card.onclick = () => {
        Sound.play("tap");
        currentLevel = lv;
        lv.start();
      };
    }
    list.appendChild(card);
  });
}

/* ---------- 結果画面（全レベル共通） ---------- */

// 各レベルの終了時にこれを呼ぶ
// cleared: クリアしたか / badge: 絵文字 / title: 見出し / lines: 詳細(HTML) / bestText: セーブする記録
function showResult({ cleared, badge, title, lines, bestText }) {
  if (cleared) {
    recordClear(currentLevel.id, bestText);
    Sound.play("clear");
  } else {
    Sound.play("fail");
  }

  $("#result-badge").textContent = badge;
  $("#result-title").textContent = title;
  $("#result-lines").innerHTML = lines;

  // 「次のレベルへ」はクリア時＆次がある時だけ表示
  const nextLv = LEVELS.find((l) => l.id === currentLevel.id + 1);
  const btnNext = $("#btn-next");
  if (cleared && nextLv) {
    btnNext.style.display = "block";
    btnNext.onclick = () => {
      Sound.play("tap");
      currentLevel = nextLv;
      nextLv.start();
    };
  } else {
    btnNext.style.display = "none";
  }

  showScreen("screen-result");
}

/* ---------- 起動時の設定（ボタンにイベントを付ける） ---------- */

window.addEventListener("DOMContentLoaded", () => {
  // タイトル → レベル選択
  $("#btn-start").onclick = () => {
    Sound.play("tap");
    renderLevelSelect();
    showScreen("screen-select");
  };

  // 効果音のON/OFF切り替え
  $("#btn-sound").onclick = () => {
    Sound.enabled = !Sound.enabled;
    $("#btn-sound").textContent = Sound.enabled ? "🔊 効果音 ON" : "🔇 効果音 OFF";
    Sound.play("tap");
  };

  // 進行データのリセット
  $("#btn-reset").onclick = () => {
    if (confirm("進行データをリセットしますか？")) {
      Storage.reset();
      saveData = Storage.load();
      renderLevelSelect();
    }
  };

  // 結果画面のボタン
  $("#btn-retry").onclick = () => {
    Sound.play("tap");
    if (currentLevel) currentLevel.start();
  };
  $("#btn-to-select").onclick = () => {
    Sound.play("tap");
    renderLevelSelect();
    showScreen("screen-select");
  };

  // 各レベルの「←」ボタン（途中でやめてレベル選択に戻る）
  document.querySelectorAll("[data-quit]").forEach((btn) => {
    btn.onclick = () => {
      if (typeof stopLv4 === "function") stopLv4(); // Lv4のアニメーションを止める
      renderLevelSelect();
      showScreen("screen-select");
    };
  });

  // PWA: サービスワーカー登録（オフラインでも遊べるようにする）
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      /* 登録できない環境でもゲームは普通に動くので無視してOK */
    });
  }
});
