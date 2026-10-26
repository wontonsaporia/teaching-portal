// 教材追加時はこの一覧に1件追加します。pathはindex.htmlからの相対パスです。
// コース = 学習目的 / problem bank = 出題集合 / format = 同じ問題集の利用方法。
window.TEACHING_COURSES = [
  {id:'care-national',subject:'care',subjectLabel:'医療・介護',title:'介護福祉士国家試験',
   description:'国家試験の出題科目・年度別過去問を学ぶ。',order:10},
  {id:'care-suction-training',subject:'care',subjectLabel:'医療・介護',title:'喀痰吸引等研修',
   description:'研修の筆記試験を、単元ごとに練習・確認する。',order:20},
  {id:'math-junior-high',subject:'math',subjectLabel:'数学',title:'中学校数学',
   description:'文章題の読解と方程式の学習教材。',order:30},
  {id:'english-eiken4',subject:'english',subjectLabel:'英語',title:'英検4級',description:'語彙学習。',hidden:true,order:40}
];
window.TEACHING_MATERIALS = [
  {id:'care-national-medical-36-38',courseId:'care-national',collectionId:'national-medical-2024-2026',subject:'care',subjectLabel:'医療・介護',grade:'介護福祉士国家試験 2024–2026',format:'公式過去問・解答ノート',title:'国家試験 医療的ケア（第36〜38回・15問）',description:'試験センターの公式問題PDFを参照しながら解答。年度別5問・公式正答との照合・ローカル保存に対応。現行制度との照合は一部継続中。',tags:['介護福祉士','医療的ケア','第36回','第37回','第38回','過去問'],path:'materials/care/national-medical-quiz.html',action:'問題集を開く',external:false},

  {
    id: 'care-suction-2018', courseId:'care-suction-training',collectionId:'suction-2018-okinawa', subject: 'care', subjectLabel: '医療・介護', grade: '喀痰吸引等研修', format: '一問一答ドリル',
    title: '喀痰吸引等研修・50問練習ドリル',
    description: '読みやすい1問表示と即時正誤判定。途中保存と間違えた問題だけの復習に対応。原文照合・正答検証は一部未完了です。',
    tags: ['喀痰吸引', '経管栄養', '感染予防', '看護', '介護', '筆記試験'],
    path: 'materials/care/suction-2018-quiz.html', action: '練習を始める', external: false
  },
  {
    id: 'care-suction-2018-test',courseId:'care-suction-training',collectionId:'suction-2018-okinawa', subject: 'care', subjectLabel: '医療・介護', grade: '喀痰吸引等研修', format: '模擬テスト',
    title: '喀痰吸引等研修・50問テスト',
    description: '最後にまとめて採点。総合正答率・分野別成績・所要時間・要復習問題の分析レポートを表示します。参考解答は非公式です。',
    tags: ['喀痰吸引', '経管栄養', '分析レポート', '模擬テスト', '50問'],
    path: 'materials/care/suction-2018-test.html', action: 'テストを始める', external: false
  },
  {
    id: 'care-suction-dashboard',courseId:'care-suction-training',kind:'analytics',hidden:true, subject: 'care', subjectLabel: '医療・介護', grade: '学習分析', format: 'ダッシュボード',
    title: '喀痰吸引等研修・学習ダッシュボード',
    description: '9単元ごとの初回正答率と直近の成績を可視化。回答履歴をもとに学習傾向を確認します。集計は未検証の参考解答に基づきます。',
    tags: ['喀痰吸引', '経管栄養', '単元別', '学習記録', '成績', '分析'],
    path: 'materials/care/dashboard.html', action: '学習状況を見る', external: false
  },
  {
    id: 'math-word-chunks',courseId:'math-junior-high',subject: 'math', subjectLabel: '数学', grade: '中1', format: 'HTML',
    title: '数学文章題を読む',
    description: '連続する整数・偶数の文章を、意味のまとまりごとに読み、式へ置きかえるスライド教材。',
    tags: ['文章題', '整数', '偶数', '方程式', '読解', '色分け'],
    path: 'materials/math/word-chunks.html', action: '教材を開く', external: false
  },
  {id:'math-equation-reading',courseId:'math-junior-high',collectionId:'math-equation-reading-v01',subject:'math',subjectLabel:'数学',grade:'中1〜中2',format:'自由記述・自己評価',title:'方程式の利用｜文章題読解特訓（40問）',description:'比較・括弧・整数・割合など8単元。解答例と読解ポイントを見ながら反復練習。回答記録は画面を更新すると消去されます。',tags:['方程式の利用','文章題','読解','数量関係','立式','40問'],path:'materials/math/equation-reading.html',action:'問題集を開く',external:false},
  {id:'math-proportion-reading',courseId:'math-junior-high',collectionId:'math-proportion-reading-v01',subject:'math',subjectLabel:'数学',grade:'中1',format:'自由記述・自己評価',title:'比例・反比例の利用｜読解特訓（30問）',description:'変数・比例定数・反比例・表・変域・モデルの仮定を読む6単元。解答例との比較と要復習の絞り込みに対応。記録はページ更新で消えます。',tags:['関数','比例','反比例','利用','文章題','30問'],path:'materials/math/proportion-reading.html',action:'問題集を開く',external:false},
  {
    id: 'math-integer-equations',courseId:'math-junior-high',subject: 'math', subjectLabel: '数学', grade: '中1〜中2', format: 'HTML',
    title: '整数と方程式の問題集',
    description: '整数に関する文章題を、方程式を使って考える練習用HTML教材。',
    tags: ['整数', '文章題', '一次方程式', '連立方程式', '練習問題'],
    path: 'materials/math/integer-equations.html', action: '教材を開く', external: false
  },
  {
    id: 'english-eiken4', courseId:'english-eiken4', hidden: true, subject: 'english', subjectLabel: '英語', grade: '英検4級', format: '外部リポジトリ',
    title: '英検4級 語彙教材',
    description: '既存の教材プロジェクトへの入口。現在はGitHubのリポジトリを開きます。',
    tags: ['英検', '4級', '語彙', '単語'],
    path: 'https://github.com/wontonsaporia/eiken4-vocabulary01', action: 'リポジトリを開く', external: true
  }
];
