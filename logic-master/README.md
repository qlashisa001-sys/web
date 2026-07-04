# 👑 論理マスターへの道

高校1年数学「集合と命題」の **逆・裏・対偶** をゲーム感覚で反復練習できる、スマホ対応Webゲームです。

- HTML / CSS / JavaScript のみ（ビルド不要・npm不要）
- **index.html をブラウザで開くだけで動きます**
- スマホ縦画面を最優先にデザイン（PCでも遊べます）
- PWA対応（スマホのホーム画面に追加すればオフラインでも遊べます）

## 🎮 遊び方

「P → Q」という命題に対して：

| 変形 | 形 |
|------|-----|
| 逆   | Q → P |
| 裏   | ¬P → ¬Q |
| 対偶 | ¬Q → ¬P |

これを5つのレベルで反復練習します。クリアすると次のレベルが解放されます。

| レベル | 内容 |
|--------|------|
| Lv1 新人 | 論理訓練所。教官の号令で反射練習。1問3秒×20問 |
| Lv2 見習い | 矢印道場。師範の「対偶！」の叫びに合う数式を即タップ。コンボあり |
| Lv3 命題探偵 | 事件ファイル形式。日本語の命題から「犯人（変形）」を推理 |
| Lv4 対偶の達人 | リズム修行。流れるカードをタイミングよく判定。Perfect/Good/Miss |
| Lv5 論理王 | 論客ロンパ卿とのバトル。挑発に負けず制限時間内に答えろ！ |

進行状況はブラウザ（localStorage）に自動保存されます。

## 📁 ディレクトリ構成

```
logic-master/
├── index.html      … 画面の骨組み（これを開くだけで動く）
├── manifest.json   … PWAの設定
├── sw.js           … Service Worker（オフライン対応）
├── icon.svg        … アプリアイコン
├── README.md       … このファイル
├── css/
│   └── style.css   … デザイン全部（色は先頭の変数で一括変更可）
└── js/
    ├── questions.js … ★問題データ（ここに追加するだけで問題が増える）
    ├── audio.js     … 効果音（あとでmp3に差し替え可能な構成）
    ├── storage.js   … セーブデータ管理
    ├── main.js      … 画面切り替え・共通処理・変形ルール
    ├── lv1.js       … Lv1 論理訓練所
    ├── lv2.js       … Lv2 矢印道場
    ├── lv3.js       … Lv3 命題探偵
    ├── lv4.js       … Lv4 リズム修行
    └── lv5.js       … Lv5 論理バトル
```

## ✏️ 問題の追加方法

`js/questions.js` の `PROPOSITIONS` に1行足すだけです。

```js
{ p: "仮定", q: "結論", np: "仮定の否定", nq: "結論の否定" },
```

例：

```js
{ p: "x=5", q: "x²=25", np: "x≠5", nq: "x²≠25" },
```

逆・裏・対偶はゲーム側が自動で組み立てるので、100問でも簡単に増やせます。
Lv3（命題探偵）とLv5（論理バトル）に自動で反映されます。

## 🔊 効果音の差し替え方法

今は `js/audio.js` がその場で電子音を合成しています。
本物の効果音にしたい場合は、`sounds/` フォルダを作って mp3 を置き、
`Sound.play()` の中を `new Audio("sounds/correct.mp3").play()` のように書き換えるだけです。

## 🌐 GitHub Pages で公開する方法

1. [GitHub](https://github.com/) にログインし、右上の「＋」→「New repository」
2. リポジトリ名を入力（例：`logic-master`）して「Create repository」
3. この `logic-master` フォルダの中身をアップロードする
   - ブラウザだけでOK：リポジトリの「Add file」→「Upload files」で
     フォルダごとドラッグ＆ドロップ →「Commit changes」
   - Gitを使う場合：
     ```bash
     cd logic-master
     git init
     git add .
     git commit -m "論理マスターへの道 初版"
     git branch -M main
     git remote add origin https://github.com/あなたのユーザー名/logic-master.git
     git push -u origin main
     ```
4. リポジトリの「Settings」→ 左メニュー「Pages」
5. 「Source」を **Deploy from a branch**、Branch を **main** / **(root)** にして「Save」
6. 1〜2分待つと、次のURLで公開されます：

   `https://あなたのユーザー名.github.io/logic-master/`

このURLをスマホで開き、「ホーム画面に追加」すればアプリのように遊べます📱

## 🚀 将来の拡張アイデア（設計済み）

- ランキング／タイムアタック（`storage.js` に記録を追加）
- 問題追加（`questions.js` に足すだけ）
- キャラクター・レベル追加（`lvX.js` を1ファイル増やして `main.js` の `LEVELS` に登録）
- BGM追加（`audio.js` に組み込み）
- 必要条件・十分条件編／真偽判定編／数学Ⅰ全範囲への拡張
