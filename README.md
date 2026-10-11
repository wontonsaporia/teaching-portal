# 学習指導ポータル

数学・英語・美術・医療／介護の教材をまとめ、授業中に探して開くためのポータルです。
HTML・CSS・JavaScriptのみで動き、ビルドやnpmのインストールは不要です。

## 開き方

リポジトリをダウンロードまたはcloneし、`index.html`をブラウザで開きます。
教材名・単元・キーワードで検索し、教科で絞り込めます。
GitHub上のファイル閲覧画面はポータルの実行画面ではありません。公開版は https://wontonsaporia.github.io/teaching-portal/index.html です。

## 構成

- `index.html`：教材一覧
- `assets/materials.js`：教材の登録一覧
- `assets/portal.js`：検索・絞り込み
- `assets/style.css`：ポータルの見た目
- `materials/math/`：数学のHTML教材（元PDFも保存）
- `materials/english/`：今後追加する英語教材
- `materials/art/`：今後追加する美術教材

## 教材の追加

1. 教材ファイルを対応する教科フォルダに置く。
2. `assets/materials.js`の配列に、既存の項目を参考に1件追加する。
3. `id`は重複しない名前、`subject`は`math`・`english`・`art`・`care`のいずれかにする。
4. `path`は`index.html`からの相対パス、外部教材の場合は完全なURLにする。
5. 一覧から教材を開き、検索と教科絞り込みを確認する。

教材の更新は同じパスのファイルを編集します。版の履歴はGitで管理し、通常はファイル名にv2・v3を増やしません。
画像や音声などを使うHTML教材は、関連ファイルも一緒に移します。

## 初期収録

- 数学文章題を読む：`math_word_chunks_intro_v4.html`を内容を変更せず`materials/math/word-chunks.html`として収録。
- 整数と方程式の問題集：`materials/math/integer-equations.html`。元PDFの全32問をHTML化し、単元リンク・記入欄・印刷ボタンを追加。元PDFは`materials/math/integer-equations.pdf`に保存。
- 喀痰吸引等研修：2018年後期筆記試験に基づく一問一答ドリル、模擬テスト、学習ダッシュボード。正答は非公式の推論で、原文照合が未完了。
- 英検4級 語彙教材：現在ポータルの一覧から非表示（`hidden: true`）。元ファイル・リンク先は削除していません。
- 新規問題集の追加手順：`materials/care/QUESTION-BANK-GUIDE.md`を参照。

## 今後

教材を少しずつ追加し、授業で使いながら一覧や分類を調整します。
公開中のWeb版を継続改善します。過去問の追加は原文照合、正答根拠の確認、二次利用条件の確認を経て実施します。
