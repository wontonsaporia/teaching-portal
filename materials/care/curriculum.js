/* 2026-10-11 参照情報。規制は自動更新されません。定期的に一次資料との再照合が必要です。 */
(function(){
const unitDefinitions=[
 {id:"human",title:"人間と社会",short:"人間と社会",chapter:1},
 {id:"healthcare",title:"保健医療制度とチーム医療",short:"制度・連携",chapter:2},
 {id:"safety",title:"安全な療養生活",short:"安全な療養",chapter:3},
 {id:"infection",title:"清潔保持と感染予防",short:"感染予防",chapter:4},
 {id:"observation",title:"健康状態の把握",short:"健康観察",chapter:5},
 {id:"suction-general",title:"たんの吸引・概論",short:"吸引・概論",chapter:6},
 {id:"suction-practice",title:"たんの吸引・実施手順",short:"吸引・実施",chapter:7},
 {id:"feeding-general",title:"経管栄養・概論",short:"経管栄養・概論",chapter:8},
 {id:"feeding-practice",title:"経管栄養・実施手順",short:"経管栄養・実施",chapter:9}
];
const sections=[
 [1,6,"human"],[7,10,"healthcare"],[11,12,"safety"],[13,17,"infection"],
 [18,20,"observation"],[21,26,"suction-general"],[27,33,"suction-practice"],
 [34,40,"feeding-general"],[41,50,"feeding-practice"]
];
const unitOf=n=>(sections.find(([a,b])=>n>=a&&n<=b)||[])[2]||"uncategorized";
const policySources=[
 {id:"law",name:"社会福祉士及び介護福祉士法",kind:"現行法",url:"https://laws.e-gov.go.jp/law/362AC0000000030",checked:"2026-10-11",note:"法令検索で現在施行の条文と改正履歴を確認。施行期日ごとに再確認が必要。"},
 {id:"regulation",name:"社会福祉士及び介護福祉士法施行規則",kind:"現行省令",url:"https://laws.e-gov.go.jp/law/362M50000100049",checked:"2026-10-11",note:"第1条に医師の指示の下で行う5種類の行為を規定。直近表示の施行履歴を確認。"},
 {id:"mhlw-system",name:"厚生労働省 喀痰吸引等制度について",kind:"制度案内",url:"https://www.mhlw.go.jp/seisakunitsuite/bunya/hukushi_kaigo/seikatsuhogo/tannokyuuin/01_seido_01.html",checked:"2026-10-11",note:"制度説明資料の入口。資料に旧年号が含まれる場合があるため、法令の現行性とは分けて扱う。"},
 {id:"remote",name:"喀痰吸引等研修における通信・遠隔研修の取扱い（令和7年7月14日）",kind:"事務連絡",url:"https://www.mhlw.go.jp/content/001520490.pdf",checked:"2026-10-11",note:"基本研修の講義に限り通信・遠隔研修が可能。演習と実地研修は対象外。"},
 {id:"reform-2026",name:"規制改革実施計画（令和8年7月21日閣議決定）抄",kind:"検討段階",url:"https://www.mhlw.go.jp/content/12300000/001750957.pdf",checked:"2026-10-11",note:"食道ろうによる経管栄養の追加について検討を開始する方針。現行の実施可能行為に追加されたわけではない。"},
 {id:"okinawa",name:"沖縄県 令和8年度喀痰吸引等研修の受講生募集",kind:"地域運用",url:"https://www.pref.okinawa.jp/kyoiku/ippanfukushi/1007891/1039950.html",checked:"2026-10-11",note:"研修募集・運用情報。国法令に加えて都道府県の最新情報を照合。"},
 {id:"jmar-2012",name:"平成23年度 サンプル問題作成報告書（59問）",kind:"歴史資料・採録候補",url:"https://www.jmar.biz/pdf/public/report240423.pdf",checked:"2026-10-11",note:"カリキュラム9章の参照資料。2012年当時の基準であり、現在の正答根拠として単独採用しない。"}
];
const raw=window.CARE_QUIZ_QUESTIONS||[];
const questions=raw.map(item=>{
 const unitId=unitOf(item.n),requiresFigure=item.n===21;
 return {...item,
  id:"suction-2018-q"+String(item.n).padStart(2,"0"),
  examId:"suction-2018-okinawa",
  unitId,
  source:{label:"平成30年度後期 第1回筆記試験",page:item.sourcePage||Math.min(11,Math.ceil(item.n/5)),number:item.n},
  sourceVerification:"pending", // 過去の「照合済み」記載に監査記録がないため保守的に未完了とする
  answerVerification:"provisional",
  requiresFigure,figureStatus:requiresFigure?"pending":"not_required",
  regulatoryReview: [3,7,8,9,12,14,17,21,23,24,27,28,30,32,35,39,40,44,46,47].includes(item.n)?"required":"not_assessed"
 };
});
window.CARE_BANK={
 id:"suction-2018-okinawa",name:"平成30年度後期 喀痰吸引等研修 筆記試験",year:2018,
 units:unitDefinitions,policySources,questions,
 reviewDate:"2026-10-11", reviewState:"partial",
 getUnit:id=>unitDefinitions.find(u=>u.id===id),
 scoreEligible:q=>!q.requiresFigure || q.figureStatus==="verified",
 metadata:{
  text:"元の問題文は変更せずに保管し、逐字照合が終わってからsourceVerificationをverifiedに変更する。",
  answers:"公式解答表がないため、すべての正答を暫定と扱う。最新の法令・実施基準と当時の出題意図を区別する。",
  images:"問21は図の再制作・原本照合が完了するまで採点対象外とする。",
  version:"bank-schema-1"
 }
};
})();
