# 学習指導ポータル

数学・英語・美術の教材をまとめ、授業中に探して開くためのポータルです。
HTML・CSS・JavaScriptのみで動き、ビルドやnpmのインストールは不要です。

## 開き方

リポジトリをダウンロードまたはcloneし、`index.html`をブラウザで開きます。
教材名・単元・キーワードで検索し、教科で絞り込めます。
GitHub上のファイル閲覧画面はポータルの実行画面ではありません。Web公開はまだ設定していません。

## 構成

- `index.html`：教材一覧
- `assets/materials.js`：教材の登録一覧
- `assets/portal.js`：検索・絞り込み
- `assets/style.css`：ポータルの見た目
- `materials/math/`：数学のHTML教材・PDF
- `materials/english/`：今後追加する英語教材
- `materials/art/`：今後追加する美術教材

## 教材の追加

1. 教材ファイルを対応する教科フォルダに置く。
2. `assets/materials.js`の配列に、既存の項目を参考に1件追加する。
3. `id`は重複しない名前、`subject`は`math`・`english`・`art`のいずれかにする。
4. `path`は`index.html`からの相対パス、外部教材の場合は完全なURLにする。
5. 一覧から教材を開き、検索と教科絞り込みを確認する。

教材の更新は同じパスのファイルを編集します。版の履歴はGitで管理し、通常はファイル名にv2・v3を増やしません。
画像や音声などを使うHTML教材は、関連ファイルも一緒に移します。

## 初期収録

- 数学文章題を読む：`math_word_chunks_intro_v4.html`を内容を変更せず`materials/math/word-chunks.html`として収録。
- 整数と方程式の問題集：`integer_equations_handout.pdf`を`materials/math/integer-equations.pdf`として収録。
- 英検4級 語彙教材：既存の`wontonsaporia/eiken4-vocabulary01`へのリンク。教材本体の移動は今後行います。

## 今後

教材を少しずつ追加し、授業で使いながら一覧や分類を調整します。
生徒に配布するWeb版の公開方法は別途決めます。
