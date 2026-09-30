// 教材追加時はこの一覧に1件追加します。pathはindex.htmlからの相対パスです。
window.TEACHING_MATERIALS = [
  {
    id: 'math-word-chunks', subject: 'math', subjectLabel: '数学', grade: '中1', format: 'HTML',
    title: '数学文章題を読む',
    description: '連続する整数・偶数の文章を、意味のまとまりごとに読み、式へ置きかえるスライド教材。',
    tags: ['文章題', '整数', '偶数', '方程式', '読解', '色分け'],
    path: 'materials/math/word-chunks.html', action: '教材を開く', external: false
  },
  {
    id: 'math-integer-equations', subject: 'math', subjectLabel: '数学', grade: '中1〜中2', format: 'PDF',
    title: '整数と方程式の問題集',
    description: '整数に関する文章題を、方程式を使って考える練習用プリント。',
    tags: ['整数', '文章題', '一次方程式', '連立方程式', '練習問題'],
    path: 'materials/math/integer-equations.pdf', action: 'PDFを開く', external: false
  },
  {
    id: 'english-eiken4', subject: 'english', subjectLabel: '英語', grade: '英検4級', format: '外部リポジトリ',
    title: '英検4級 語彙教材',
    description: '既存の教材プロジェクトへの入口。現在はGitHubのリポジトリを開きます。',
    tags: ['英検', '4級', '語彙', '単語'],
    path: 'https://github.com/wontonsaporia/eiken4-vocabulary01', action: 'リポジトリを開く', external: true
  }
];
