/* 新規試験問題のデータひな型。実際に使用するときは、原文と根拠を照合してから別IDで登録します。 */
window.EXAMPLE_QUIZ_BANK={
 id:"example-exam-unique-id",
 title:"試験問題集の正式名称",
 source:{title:"公開資料の名称",year:2026,url:"",licenseStatus:"要確認"},
 units:[{id:"unit-1",title:"単元名"}],
 questions:[
  {
   id:"example-q01",examId:"example-exam-unique-id",unitId:"unit-1",
   n:1,
   stem:"原本の設問を省略せずそのまま転記（これはひな型であり実際の設問ではありません）",
   options:["原本の選択肢1","原本の選択肢2","原本の選択肢3","原本の選択肢4"],
   key:null,
   explanation:"",
   source:{page:1,number:1},
   sourceVerification:"pending",
   answerVerification:"pending",
   answerBasis:{type:"inference",sources:[],reviewedAt:null},
   requiresFigure:false,
   figureStatus:"not_required"
  }
 ]
};
/*
設計上の不変条件：
- options配列は原本の順序で保持し、表示順のシャッフルはUIに限定する。
- keyは原本の1〜4番を指す。採点時に表示上の位置番号で上書きしない。
- 問題IDは年度・試験単位で一意にする。
- 資料の著作権・再掲載許諾を確認する。
- key未決定や図版未整備の問題は採点対象外とする。
- 問題文そのものの原文を変更しない。現在の法令による注記は別フィールドに置く。
*/
