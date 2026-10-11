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

// 第38回：試験センター公式の読み上げ用HTMLの問題101〜105を採録。
// ルビ用の ｛よみ｝ はUIで ruby として組版し、漢字・送り仮名等の原文は変更しない。
const fullText38={
 101:{stem:'次の記述のうち、バイタルサインを測定するときの留意点として、最も適切なものを1つ選びなさい。',
 options:[
 '非接触型体温計による測定では、環境温度に注意する。',
 '脈拍の測定では、橈骨動脈｛とうこつどうみゃく｝に拇指｛ぼし｝で触れる。',
 '呼吸の測定では、ゆっくりと息をするように伝えてから行う。',
 '血圧測定では、上腕にマンシェットを隙間のないように巻く。',
 '意識レベルは、まず身体を揺さぶって反応をみる。']},
 102:{stem:'気管カニューレの構造等に関する次の記述のうち、正しいものを1つ選びなさい。',
 options:[
 '気管カニューレは、咽頭に挿入されている。',
 '気管カニューレは、交換の必要がない。',
 'カフは、カニューレの上端についている。',
 'カフには、滅菌蒸留水が入れてある。',
 'サイドチューブから、カフの上部の貯留物を吸引することができる。']},
 103:{stem:'Ａさん（85歳、男性）は、慢性閉塞性肺疾患（chronic obstructive pulmonary disease）で、介護老人福祉施設に入所している。ある日、Ａさんから、「痰｛たん｝がからんでいて、咳｛せき｝をしても出せない」という訴えがあった。介護福祉士が呼吸回数を確認すると、1分間に22回で、ゴロゴロという音がしていた。看護職からは、右肺に痰｛たん｝が貯留しやすいという情報提供があった。口腔内吸引｛こうくうないきゅういん｝をすると、粘性の強い透明な痰｛たん｝が吸引できた。\nこのとき、介護福祉士が喀痰排出｛かくたんはいしゅつ｝を促すためにＡさんに行う対応として、最も適切なものを1つ選びなさい。',
 options:[
 '居室の湿度を30％に保つ。',
 '水分摂取を控えるように伝える。',
 '左側を下にした体位を勧める。',
 '太い吸引チューブに変える。',
 'ベッド上での安静を勧める。']},
 104:{stem:'次の記述のうち、胃の構造として、正しいものを1つ選びなさい。',
 options:[
 '幽門から始まり噴門で終わる。',
 '左上方を胃底部といい、食べ物を一時的にためる。',
 '左下方の縁を小弯｛しょうわん｝という。',
 '胃には3つの生理的狭窄部｛せいりてききょうさくぶ｝がある。',
 '胃に続く小腸は、空腸という。']},
 105:{stem:'次の記述のうち、ボタン型胃ろうチューブを挿入している利用者に対して、介護福祉士が行うケアとして、最も適切なものを1つ選びなさい。',
 options:[
 '胃ろう周囲の皮膚に発赤がある場合は、軟膏｛なんこう｝を塗布する。',
 '1日に2、3回、胃ろうチューブを回転させて、癒着を防ぐ。',
 '胃ろうチューブの抜去予防のため、歩行は避けるように勧める。',
 '胃ろう周囲の皮膚は石けんとぬるま湯で洗浄して、清潔を保つ。',
 '栄養剤を注入する前には、胃ろう部を消毒する。']}
};
for(const q of questions){
 if(q.round!==38)continue;
 const text=fullText38[q.n];
 if(!text||!text.stem||text.options.length!==5||text.options.some(x=>!x))throw Error('Missing official text for problem '+q.n);
 q.stem=text.stem;
 q.options=text.options;
 q.transcriptionSource='https://www.sssc.or.jp/kaigo/past_exam/pdf/no38/listen_k_pm_38.html';
 q.transcriptionState='official-html-reviewed';
}

window.NATIONAL_MEDICAL_BANK={version:1,sets,questions,sourcePolicy:'https://www.sssc.or.jp/pastissues/'};
})();