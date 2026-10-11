/* Official reference index / not a transcription of copyrighted exam questions.
 * Text and options are read unchanged in the examiner's original PDFs.
 * Keys verified against SSSC official published answer tables on 2026-10-12.
 */
(()=>{
'use strict';
const base='https://www.sssc.or.jp/kaigo/past_exam/pdf/';
const sets=[
 {round:38,year:2026,examYear:'令和7年度',pdf:base+'no38/k_pm_05_38.pdf',answers:[1,5,3,2,4],
  questions:[{n:101,page:1,topic:'バイタルサインの測定'},{n:102,page:1,topic:'気管カニューレの構造'},{n:103,page:2,topic:'喀痰排出の支援'},{n:104,page:2,topic:'胃の構造'},{n:105,page:3,topic:'胃ろうチューブのケア'}],
  answerSource:base+'no38/k_kijun_seitou.pdf'},
 {round:37,year:2025,examYear:'令和6年度',pdf:base+'no37/k_am_08_37.pdf',answers:[1,4,4,1,3],
  questions:[{n:59,page:1,topic:'成人の救急蘇生法',review:'2025年版JRC蘇生ガイドラインとの照合'},{n:60,page:1,topic:'喀痰の排出機序'},{n:61,page:2,topic:'口腔内の喀痰吸引'},{n:62,page:2,topic:'消化器症状の理解'},{n:63,page:3,topic:'経鼻経管栄養と意思の尊重'}],
  answerSource:base+'no37/k_kijun_seitou.pdf'},
 {round:36,year:2024,examYear:'令和5年度',pdf:base+'no36/k_am_08_36.pdf',answers:[5,4,1,2,3],
  questions:[{n:59,page:1,topic:'喀痰吸引等の実施体制',review:'現行の登録制度と照合'},{n:60,page:1,topic:'呼吸器官の構造'},{n:61,page:2,topic:'喀痰吸引の準備',review:'現行の手順・研修資料と照合'},{n:62,page:2,topic:'経管栄養に伴うトラブル'},{n:63,page:3,topic:'経管栄養時の利用者対応'}],
  answerSource:base+'no36/k_kijun_seitou.pdf'}
];
const questions=sets.flatMap(s=>s.questions.map((q,i)=>({...q,id:s.round+'-'+q.n,round:s.round,year:s.year,answer:s.answers[i],pdf:s.pdf,source:s.pdf+'#page='+q.page,answerSource:s.answerSource})));
if(questions.length!==15||questions.some(x=>x.answer<1||x.answer>5))throw Error('Question index integrity failed');
window.NATIONAL_MEDICAL_BANK={version:1,sets,questions,sourcePolicy:'https://www.sssc.or.jp/pastissues/'};
})();