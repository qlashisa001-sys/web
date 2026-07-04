/* ==============================================
   storage.js — セーブデータの管理
   ブラウザの localStorage に進行状況を保存します。
   （アプリを閉じても記録が残る仕組み）

   保存している内容：
     unlocked: 解放済みの最大レベル（1〜5）
     best:     各レベルのベスト記録（表示用の文字列）
   ============================================== */

const Storage = {
  KEY: "logicMasterSave",   // localStorage に保存するときの名前

  // セーブデータを読み込む（壊れていたら初期状態に戻す）
  load() {
    try {
      const data = JSON.parse(localStorage.getItem(this.KEY));
      if (data && typeof data.unlocked === "number") return data;
    } catch (e) {
      // 読み込み失敗は無視して初期データを返す
    }
    return { unlocked: 1, best: {} };
  },

  // セーブデータを書き込む
  save(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  // 全部消して最初からにする
  reset() {
    localStorage.removeItem(this.KEY);
  },
};

// ゲーム全体で使うセーブデータ（起動時に読み込む）
let saveData = Storage.load();

// レベルをクリアしたときに呼ぶ：次のレベルを解放してベスト記録を更新
function recordClear(level, bestText) {
  if (level >= saveData.unlocked && level < 5) {
    saveData.unlocked = level + 1;
  }
  saveData.best[level] = bestText;
  Storage.save(saveData);
}
