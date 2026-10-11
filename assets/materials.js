// 教材追加時はこの一覧に1件追加します。pathはindex.htmlからの相対パスです。
window.TEACHING_MATERIALS = [
  {
    id: 'care-suction-2018', subject: 'care', subjectLabel: '医療・介護', grade: '喀痰吸引等研修', format: '一問一答ドリル',
    title: '喀痰吸引等研修・50問練習ドリル',
    description: '読みやすい1問表示と即時正誤判定。途中保存と間違えた問題だけの復習に対応。原文照合・正答検証は一部未完了です。',
    tags: ['喀痰吸引', '経管栄養', '感染予防', '看護', '介護', '筆記試験'],
    path: 'materials/care/suction-2018-quiz.html', action: '練習を始める', external: false
  },
  {
    id: 'care-suction-2018-test', subject: 'care', subjectLabel: '医療・介護', grade: '喀痰吸引等研修', format: '模擬テスト',
    title: '喀痰吸引等研修・50問テスト',
    description: '最後にまとめて採点。総合正答率・分野別成績・所要時間・要復習問題の分析レポートを表示します。参考解答は非公式です。',
    tags: ['喀痰吸引', '経管栄養', '分析レポート', '模擬テスト', '50問'],
    path: 'materials/care/suction-2018-test.html', action: 'テストを始める', external: false
  },
  {
    id: 'care-suction-dashboard', subject: 'care', subjectLabel: '医療・介護', grade: '学習分析', format: 'ダッシュボード',
    title: '喀痰吸引等研修・学習ダッシュボード',
    description: '9単元ごとの初回正答率と直近の成績を可視化。回答履歴をもとに学習傾向を確認します。集計は未検証の参考解答に基づきます。',
    tags: ['喀痰吸引', '経管栄養', '単元別', '学習記録', '成績', '分析'],
    path: 'materials/care/dashboard.html', action: '学習状況を見る', external: false
  },
  {
    id: 'math-word-chunks', subject: 'math', subjectLabel: '数学', grade: '中1', format: 'HTML',
    title: '数学文章題を読む',
    description: '連続する整数・偶数の文章を、意味のまとまりごとに読み、式へ置きかえるスライド教材。',
    tags: ['文章題', '整数', '偶数', '方程式', '読解', '色分け'],
    path: 'materials/math/word-chunks.html', action: '教材を開く', external: false
  },
  {
    id: 'math-integer-equations', subject: 'math', subjectLabel: '数学', grade: '中1〜中2', format: 'HTML',
    title: '整数と方程式の問題集',
    description: '整数に関する文章題を、方程式を使って考える練習用HTML教材。',
    tags: ['整数', '文章題', '一次方程式', '連立方程式', '練習問題'],
    path: 'materials/math/integer-equations.html', action: '教材を開く', external: false
  },
  {
    id: 'english-eiken4', subject: 'english', subjectLabel: '英語', grade: '英検4級', format: '外部リポジトリ',
    title: '英検4級 語彙教材',
    description: '既存の教材プロジェクトへの入口。現在はGitHubのリポジトリを開きます。',
    tags: ['英検', '4級', '語彙', '単語'],
    path: 'https://github.com/wontonsaporia/eiken4-vocabulary01', action: 'リポジトリを開く', external: true
  }
];
