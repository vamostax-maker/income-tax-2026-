import { useState, useMemo, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, onSnapshot, setDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC9xtnYNRgWfiX9sdRQ5jci16yplWZ8kyg",
  authDomain: "expert-tax-app.firebaseapp.com",
  projectId: "expert-tax-app",
  storageBucket: "expert-tax-app.firebasestorage.app",
  messagingSenderId: "541200335203",
  appId: "1:541200335203:web:c828ac49b13464a6d25356",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const STAGES = ["작성중(담당자)", "1차 결재중(팀장)", "재무제표 발송", "신고서 초안 발송", "납부서 발송"];
const STAGE_COLOR = {
  "작성중(담당자)":    { bg: "#fff3cd", text: "#856404", dot: "#ffc107" },
  "1차 결재중(팀장)": { bg: "#cfe2ff", text: "#084298", dot: "#0d6efd" },
  "재무제표 발송":     { bg: "#ffe4e1", text: "#9b1c1c", dot: "#ef4444" },
  "신고서 초안 발송":  { bg: "#d1e7dd", text: "#0a3622", dot: "#198754" },
  "납부서 발송":       { bg: "#e2d9f3", text: "#432874", dot: "#6f42c1" },
};
const PALETTE = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#f97316","#ec4899"];

const RAW = [
  { no:1,   staff:"곽민영", name:"돌리앗" },
  { no:2,   staff:"곽민영", name:"힌지큐브" },
  { no:3,   staff:"곽민영", name:"심가당" },
  { no:4,   staff:"곽민영", name:"아이제이네일" },
  { no:5,   staff:"곽민영", name:"링커" },
  { no:6,   staff:"곽민영", name:"아이스드림 퇴촌 (서동진)" },
  { no:7,   staff:"곽민영", name:"아이스드림 (서수현)" },
  { no:8,   staff:"곽민영", name:"건강운동과학연구소(지무엽)" },
  { no:9,   staff:"곽민영", name:"아뜰리에호수 안양" },
  { no:10,  staff:"곽민영", name:"샤인소프트_신광배" },
  { no:11,  staff:"곽민영", name:"샤인소프트_신미나" },
  { no:12,  staff:"곽민영", name:"샤인소프트_신미나 어머니" },
  { no:13,  staff:"곽민영(신고대리)", name:"돌리앗 이모님(문정애)" },
  { no:14,  staff:"곽민영(신고대리)", name:"김현조 신고대리 (1)" },
  { no:15,  staff:"곽민영(신고대리)", name:"김현조 신고대리 (2)" },
  { no:16,  staff:"곽민영(신고대리)", name:"김현조 신고대리 (3)" },
  { no:17,  staff:"곽민영(신고대리)", name:"김현조 신고대리 (4)" },
  { no:18,  staff:"방민혁", name:"89MM" },
  { no:19,  staff:"방민혁", name:"포차마실" },
  { no:20,  staff:"방민혁", name:"SH디자인" },
  { no:21,  staff:"방민혁", name:"한촌설렁탕 가정점 (박헌진)" },
  { no:22,  staff:"방민혁", name:"꽃술래" },
  { no:23,  staff:"방민혁", name:"브레드앤쿡(최은주)" },
  { no:24,  staff:"방민혁", name:"에프엔에스_최진" },
  { no:25,  staff:"방민혁", name:"아뜰리에호수 부천" },
  { no:26,  staff:"방민혁", name:"아뜰리에호수 분당" },
  { no:27,  staff:"방민혁", name:"아뜰리에호수 수원인계점" },
  { no:28,  staff:"방민혁", name:"파노 법률사무소" },
  { no:29,  staff:"방민혁", name:"아뜰리에호수 대전" },
  { no:30,  staff:"방민혁", name:"아뜰리에호수 송도" },
  { no:31,  staff:"방민혁", name:"스터드" },
  { no:32,  staff:"방민혁", name:"아뜰리에호수 대구" },
  { no:33,  staff:"방민혁", name:"아뜰리에호수 부평" },
  { no:34,  staff:"방민혁", name:"오롯밀(꽃술래 대표)" },
  { no:35,  staff:"방민혁", name:"이비엠(정경호 대표)" },
  { no:36,  staff:"방민혁", name:"봄패밀리_개인들 5명" },
  { no:37,  staff:"방민혁(신고대리)", name:"메종꼬꼬" },
  { no:38,  staff:"박지석", name:"제이널리스튜디오" },
  { no:39,  staff:"박지석", name:"임대사업자(봄패밀리)_김지수" },
  { no:40,  staff:"박지석", name:"임대사업자(봄패밀리)_김혜수" },
  { no:41,  staff:"박지석", name:"BS컨설팅" },
  { no:42,  staff:"박지석", name:"클레프뮤직" },
  { no:43,  staff:"박지석", name:"리하이로라" },
  { no:44,  staff:"박지석", name:"존앤321(윤종규)" },
  { no:45,  staff:"박지석", name:"미태리파스타 분당아름마을점" },
  { no:46,  staff:"박지석", name:"피어리필라테스" },
  { no:47,  staff:"박지석", name:"무브앤발란스 근골격운동센터" },
  { no:48,  staff:"박지석", name:"행복공간 (평택)" },
  { no:49,  staff:"박지석", name:"행복공간 (천안)" },
  { no:50,  staff:"박지석", name:"구가네찹쌀탕수육(구형모)" },
  { no:51,  staff:"박지석", name:"애플꼬마김밥 송도 닥터플러스점" },
  { no:52,  staff:"박지석", name:"엑스바이트" },
  { no:53,  staff:"박지석", name:"인딕슬로우" },
  { no:54,  staff:"박지석", name:"리엔터테인먼트" },
  { no:55,  staff:"박지석", name:"바른(조미경)" },
  { no:56,  staff:"박지석", name:"제이제이 컨설팅" },
  { no:57,  staff:"박지석", name:"연세탑수학과학전문학원" },
  { no:58,  staff:"박지석", name:"[성실] 미인메디코스" },
  { no:59,  staff:"박지석", name:"엠디김밥연구소(홍지미)" },
  { no:60,  staff:"박지석", name:"에스케이랩" },
  { no:61,  staff:"박지석", name:"노벨라(이동국)" },
  { no:62,  staff:"박지석", name:"곱창의 전설" },
  { no:63,  staff:"박지석", name:"수유리 혼밥왕 양주광사점" },
  { no:64,  staff:"박지석", name:"봄패밀리(제주)" },
  { no:65,  staff:"박지석", name:"곱창의전설 (2)" },
  { no:66,  staff:"박지석", name:"봄패밀리(제주) (2)" },
  { no:67,  staff:"박지석", name:"한미비자지원센터(이병기)" },
  { no:68,  staff:"박지석", name:"안목" },
  { no:69,  staff:"박지석", name:"이모델클랜" },
  { no:70,  staff:"박지석", name:"엔오" },
  { no:71,  staff:"박지석", name:"미라클엔지니어링" },
  { no:72,  staff:"박지석", name:"펀카(개인사업자)" },
  { no:73,  staff:"박지석(신고대리)", name:"플러스씨원(플러스프로)" },
  { no:74,  staff:"박지석(신고대리)", name:"오케이비즈(플러스프로)" },
  { no:75,  staff:"박지석(신고대리)", name:"고든소프트웨어" },
  { no:76,  staff:"박지석(신고대리)", name:"바른소프트웨어" },
  { no:77,  staff:"박지석(신고대리)", name:"중앙전람(김윤정)" },
  { no:78,  staff:"박지석(신고대리)", name:"미켈란" },
  { no:79,  staff:"박지석(신고대리)", name:"중앙전람(최숙향)_부동산" },
  { no:80,  staff:"박지석(신고대리)", name:"삐요레(엠디김밥)" },
  { no:81,  staff:"박지석(신고대리)", name:"행복마케팅(박선홍)" },
  { no:82,  staff:"박지석(신고대리)", name:"박진아" },
  { no:83,  staff:"임유빈", name:"램퍼스(이정윤)" },
  { no:84,  staff:"임유빈", name:"더 비디" },
  { no:85,  staff:"임유빈", name:"우리카정비" },
  { no:86,  staff:"임유빈", name:"광성정보" },
  { no:87,  staff:"임유빈", name:"레몬캔버스" },
  { no:88,  staff:"임유빈", name:"바이앤에이" },
  { no:89,  staff:"임유빈", name:"재원소재" },
  { no:90,  staff:"임유빈", name:"카액세서리" },
  { no:91,  staff:"임유빈", name:"모선미" },
  { no:92,  staff:"임유빈", name:"케이시스템" },
  { no:93,  staff:"임유빈", name:"데이큐" },
  { no:94,  staff:"임유빈", name:"참좋은건강연구소" },
  { no:95,  staff:"임유빈", name:"사이버클라우드" },
  { no:96,  staff:"임유빈", name:"주원(이주원)" },
  { no:97,  staff:"임유빈", name:"공차 숭실대점(탁은지)" },
  { no:98,  staff:"임유빈", name:"보드람치킨(윤영단 대표)" },
  { no:99,  staff:"임유빈", name:"처갓집 양념치킨 청라호수공원(김영서)" },
  { no:100, staff:"임유빈", name:"처갓집양념통닭 루원시티(김영기)" },
  { no:101, staff:"임유빈", name:"제이비엠 영어 학원(대표 민정빈)" },
  { no:102, staff:"임유빈", name:"케이티와이(대표 김태영)" },
  { no:103, staff:"임유빈", name:"발리휘트니스" },
  { no:104, staff:"임유빈", name:"[성실] 한촌설렁탕 청라점" },
  { no:105, staff:"임유빈", name:"[성실] 한촌설렁탕 도화점" },
  { no:106, staff:"임유빈", name:"[성실] 현풍닭칼국수(김혜진)" },
  { no:107, staff:"임유빈", name:"[성실] 한촌설렁탕 영천점(권용태대표)" },
  { no:108, staff:"임유빈(신고대리)", name:"와이앤솔루션" },
  { no:109, staff:"임유빈(신고대리)", name:"발리&스쿼시(폐업25.08.22)(간이)" },
  { no:110, staff:"임유빈(신고대리)", name:"신현준 대표 (대그듀드, 인플루언컴퍼니,티엔샤)" },
  { no:111, staff:"임유빈(신고대리)", name:"코아루센트럴시티 A906호" },
  { no:112, staff:"임유빈(신고대리)", name:"코아루센트럴시티 B1010호" },
  { no:113, staff:"구동현", name:"이우석" },
  { no:114, staff:"구동현", name:"강상재" },
  { no:115, staff:"구동현", name:"[성실] 재민연구소" },
  { no:116, staff:"구동현", name:"[성실] 보험조각가" },
  { no:117, staff:"구동현", name:"[성실] 문성곤" },
  { no:118, staff:"구동현", name:"문정현 선수" },
  { no:119, staff:"구동현", name:"김기호 종합소득세(증여)" },
  { no:120, staff:"안성은", name:"김영미 임대사업자(와이엠케이)" },
  { no:121, staff:"안성은", name:"이금향-마장동 (김영미대표 모친)" },
  { no:122, staff:"안성은", name:"케이컴(성실)" },
  { no:123, staff:"안성은", name:"당근보험(강신우)" },
  { no:124, staff:"안성은", name:"마라섬 의정부(컴포즈커피)" },
  { no:125, staff:"안성은", name:"나원" },
  { no:126, staff:"안성은", name:"도림천 도룡뇽" },
  { no:127, staff:"안성은", name:"피에프엘이" },
  { no:128, staff:"안성은", name:"태희상사" },
  { no:129, staff:"안성은", name:"호루라기" },
  { no:130, staff:"안성은", name:"제이에스이(하정국)" },
  { no:131, staff:"안성은", name:"제이에스이 공동사업자(하수빈/하은빈) (1)" },
  { no:132, staff:"안성은", name:"제이에스이 공동사업자(하수빈/하은빈) (2)" },
  { no:133, staff:"안성은", name:"내몸에필라테스(김선영)" },
  { no:134, staff:"안성은", name:"틈새가게 (4개) / 황신혜" },
  { no:135, staff:"안성은", name:"샾아이스크림(수택점) (3개) / 오병수" },
  { no:136, staff:"안성은", name:"[성실] 홍스타츠" },
  { no:137, staff:"안성은", name:"세일즈마스터코리아" },
  { no:138, staff:"안성은", name:"파란만잔 영등포구청점" },
  { no:139, staff:"안성은", name:"역전할머니 분당오리역점" },
  { no:140, staff:"안성은", name:"컴포즈컴피 (폐업)" },
  { no:141, staff:"안성은", name:"당근보험(강신우) (2)" },
  { no:142, staff:"기타", name:"서린테크" },
  { no:143, staff:"기타", name:"보험설계사 (김유진)" },
  { no:144, staff:"기타", name:"보험설계사 (양미란)" },
];

const STAFF_LIST = [...new Set(RAW.map(c => c.staff))];
const STAFF_COLORS = {};
STAFF_LIST.forEach((s, i) => { STAFF_COLORS[s] = PALETTE[i % PALETTE.length]; });

const BASE_CLIENTS = RAW.map(c => ({
  id: `income_${c.no}`,
  no: c.no,
  staff: c.staff,
  name: c.name,
  stage: "작성중(담당자)",
  memo: "",
}));

function Toast({ toasts, remove }) {
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background: "#fff", border: `1px solid ${t.color}`, borderLeft: `4px solid ${t.color}`, borderRadius: 10, padding: "12px 16px", minWidth: 280, boxShadow: "0 4px 20px rgba(0,0,0,0.15)", display: "flex", gap: 10, alignItems: "flex-start", animation: "slideIn 0.3s ease" }}>
          <span style={{ fontSize: 18 }}>{t.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{t.title}</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{t.msg}</div>
          </div>
          <button onClick={() => remove(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 14 }}>✕</button>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [clients, setClients] = useState(BASE_CLIENTS);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("신고현황");
  const [search, setSearch] = useState("");
  const [filterStaff, setFilterStaff] = useState("전체");
  const [filterStage, setFilterStage] = useState("전체");
  const [selected, setSelected] = useState(null);
  const [editStage, setEditStage] = useState("");
  const [editMemo, setEditMemo] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [tid, setTid] = useState(0);

  const toast = (title, msg, color = "#10b981", icon = "✅") => {
    const id = tid + 1; setTid(id);
    setToasts(p => [...p, { id, title, msg, color, icon }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };

  useEffect(() => {
    const colRef = collection(db, "income_clients");
    getDocs(colRef).then(snap => {
      if (snap.empty) {
        BASE_CLIENTS.forEach(c => {
          setDoc(doc(db, "income_clients", c.id), { stage: c.stage, memo: c.memo });
        });
      }
    });
    const unsub = onSnapshot(colRef, snap => {
      const dbData = {};
      snap.forEach(d => { dbData[d.id] = d.data(); });
      setClients(BASE_CLIENTS.map(c => ({
        ...c,
        stage: dbData[c.id]?.stage || c.stage,
        memo: dbData[c.id]?.memo || c.memo,
      })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    return clients.filter(c =>
      (c.name.includes(search) || c.staff.includes(search)) &&
      (filterStaff === "전체" || c.staff === filterStaff) &&
      (filterStage === "전체" || c.stage === filterStage)
    );
  }, [clients, search, filterStaff, filterStage]);

  const stageStats = useMemo(() => STAGES.map(s => ({
    stage: s,
    count: clients.filter(c => c.stage === s).length,
    pct: Math.round(clients.filter(c => c.stage === s).length / clients.length * 100)
  })), [clients]);

  const staffStats = useMemo(() => STAFF_LIST.map(staff => {
    const mine = clients.filter(c => c.staff === staff);
    return {
      staff,
      total: mine.length,
      done: mine.filter(c => c.stage === "납부서 발송").length,
      stageBreak: STAGES.map(s => ({ stage: s, count: mine.filter(c => c.stage === s).length })),
      color: STAFF_COLORS[staff],
    };
  }), [clients]);

  const openDetail = (c) => {
    setSelected(c);
    setEditStage(c.stage);
    setEditMemo(c.memo);
    setShowModal(true);
  };

  const save = async () => {
    try {
      await setDoc(doc(db, "income_clients", selected.id), {
        stage: editStage,
        memo: editMemo,
      });
      toast("저장 완료", `${selected.name.slice(0,15)} 저장됨`, "#10b981", "✅");
    } catch (e) {
      toast("저장 실패", "다시 시도해주세요", "#dc2626", "❌");
    }
    setShowModal(false);
  };

  const completionRate = Math.round(clients.filter(c => c.stage === "납부서 발송").length / clients.length * 100);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "'Noto Sans KR', sans-serif", flexDirection: "column", gap: 16 }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap" rel="stylesheet" />
      <div style={{ fontSize: 32 }}>⏳</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#374151" }}>데이터 불러오는 중...</div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Noto Sans KR', sans-serif", background: "#f0f2f5", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap" rel="stylesheet" />
      <style>{`@keyframes slideIn{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
      <Toast toasts={toasts} remove={id => setToasts(p => p.filter(t => t.id !== id))} />

      <div style={{ background: "linear-gradient(135deg, #1a2e1a 0%, #2d5a27 100%)", padding: "22px 28px", color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#86efac", fontWeight: 700, marginBottom: 4 }}>세무법인 엑스퍼트</div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>종합소득세 신고 진행 현황</h1>
            <div style={{ fontSize: 12, color: "#bbf7d0", marginTop: 3 }}>
              2025년 귀속 · 총 {clients.length}명 · 🔴 실시간 동기화 중
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ textAlign: "center", background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 14px" }}>
              <div style={{ fontSize: 10, color: "#86efac" }}>납부서 발송</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#4ade80" }}>{clients.filter(c => c.stage === "납부서 발송").length}명</div>
            </div>
            <div style={{ textAlign: "center", background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 14px" }}>
              <div style={{ fontSize: 10, color: "#86efac" }}>신고서 초안</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#fbbf24" }}>{clients.filter(c => c.stage === "신고서 초안 발송").length}명</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1, color: completionRate >= 80 ? "#4ade80" : completionRate >= 50 ? "#fbbf24" : "#f87171" }}>{completionRate}%</div>
              <div style={{ fontSize: 11, color: "#bbf7d0" }}>전체 완료율</div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 14, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          {stageStats.map(s => (
            <div key={s.stage} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: STAGE_COLOR[s.stage].dot }} />
              <span style={{ fontSize: 12, color: "#d1fae5" }}>{s.stage}</span>
              <span style={{ fontSize: 15, fontWeight: 900, color: STAGE_COLOR[s.stage].dot }}>{s.count}</span>
            </div>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", borderRadius: 5, overflow: "hidden", height: 7, width: 150, background: "rgba(255,255,255,0.1)" }}>
            {stageStats.map(s => <div key={s.stage} style={{ width: `${s.pct}%`, background: STAGE_COLOR[s.stage].dot }} />)}
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 28px", display: "flex" }}>
        {["신고현황", "담당자통계"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "11px 18px", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: tab === t ? 700 : 400, color: tab === t ? "#1a2e1a" : "#6b7280", borderBottom: tab === t ? "3px solid #2d5a27" : "3px solid transparent" }}>
            {t}
          </button>
        ))}
      </div>

      {tab === "신고현황" && (
        <>
          <div style={{ padding: "12px 28px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
            <input placeholder="🔍 성함 / 담당자" value={search} onChange={e => setSearch(e.target.value)}
              style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, width: 180, outline: "none" }} />
            <select value={filterStaff} onChange={e => setFilterStaff(e.target.value)}
              style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, cursor: "pointer" }}>
              <option>전체</option>
              {STAFF_LIST.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={filterStage} onChange={e => setFilterStage(e.target.value)}
              style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, cursor: "pointer" }}>
              <option>전체</option>
              {STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
            <span style={{ fontSize: 12, color: "#6b7280", marginLeft: "auto" }}><strong>{filtered.length}</strong>명 표시</span>
          </div>

          <div style={{ padding: "12px 28px", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {stageStats.map(s => {
              const sc = STAGE_COLOR[s.stage];
              const active = filterStage === s.stage;
              const pct = Math.round(s.count / clients.length * 100);
              return (
                <div key={s.stage} onClick={() => setFilterStage(active ? "전체" : s.stage)}
                  style={{ background: active ? sc.dot : sc.bg, border: `2px solid ${active ? sc.dot : sc.dot+"40"}`, borderRadius: 10, padding: "9px 14px", minWidth: 130, cursor: "pointer" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: active ? "#fff" : sc.text, marginBottom: 3 }}>{s.stage}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: active ? "#fff" : sc.dot }}>{s.count}명</div>
                  <div style={{ height: 3, borderRadius: 2, background: active ? "rgba(255,255,255,0.3)" : "#e5e7eb", marginTop: 5, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: active ? "#fff" : sc.dot }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ padding: "0 28px 28px", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 3px" }}>
              <thead>
                <tr>
                  {["No.", "성함", "담당자", "단계", "메모"].map(h => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9ca3af" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const sc = STAGE_COLOR[c.stage];
                  return (
                    <tr key={c.id} onClick={() => openDetail(c)}
                      style={{ background: "#fff", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", transition: "box-shadow 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"}>
                      <td style={{ padding: "11px 12px", fontSize: 13, fontWeight: 700, color: "#6b7280", borderRadius: "8px 0 0 8px", width: 50 }}>{c.no}</td>
                      <td style={{ padding: "11px 12px", fontSize: 13, fontWeight: 600, color: "#111827" }}>{c.name}</td>
                      <td style={{ padding: "11px 12px" }}>
                        <span style={{ background: "#f3f4f6", borderRadius: 6, padding: "3px 8px", fontSize: 12, fontWeight: 600, color: STAFF_COLORS[c.staff] }}>{c.staff}</span>
                      </td>
                      <td style={{ padding: "11px 12px" }}>
                        <span style={{ background: sc.bg, color: sc.text, borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.dot, display: "inline-block" }} />{c.stage}
                        </span>
                      </td>
                      <td style={{ padding: "11px 12px", fontSize: 12, color: "#6b7280", borderRadius: "0 8px 8px 0", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.memo || <span style={{ color: "#d1d5db" }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "담당자통계" && (
        <div style={{ padding: "20px 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14, marginBottom: 16 }}>
            {[...staffStats].sort((a,b) => (b.done/b.total)-(a.done/a.total)).map(s => {
              const pct = s.total > 0 ? Math.round(s.done / s.total * 100) : 0;
              return (
                <div key={s.staff} style={{ background: "#fff", borderRadius: 14, padding: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", borderTop: `4px solid ${s.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: "#111827" }}>{s.staff}</div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>담당 {s.total}명</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444", lineHeight: 1 }}>{pct}%</div>
                      <div style={{ fontSize: 10, color: "#9ca3af" }}>완료율</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", borderRadius: 5, overflow: "hidden", height: 6, marginBottom: 12, background: "#f3f4f6" }}>
                    {s.stageBreak.map(sb => (
                      <div key={sb.stage} style={{ width: `${s.total > 0 ? sb.count/s.total*100 : 0}%`, background: STAGE_COLOR[sb.stage].dot }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {s.stageBreak.map(sb => (
                      <div key={sb.stage} style={{ flex: 1, minWidth: 48, background: STAGE_COLOR[sb.stage].bg, borderRadius: 6, padding: "5px 3px", textAlign: "center" }}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: STAGE_COLOR[sb.stage].dot }}>{sb.count}</div>
                        <div style={{ fontSize: 8, color: STAGE_COLOR[sb.stage].text, fontWeight: 600, lineHeight: 1.4 }}>{sb.stage}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#111827", marginBottom: 14 }}>📊 완료율 순위</div>
            {[...staffStats].sort((a,b) => (b.done/b.total)-(a.done/a.total)).map((s, rank) => {
              const pct = s.total > 0 ? Math.round(s.done / s.total * 100) : 0;
              return (
                <div key={s.staff} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 22, fontSize: 13, fontWeight: 700, color: rank < 3 ? ["#f59e0b","#9ca3af","#cd7c2f"][rank] : "#d1d5db", textAlign: "center" }}>{rank+1}</div>
                  <div style={{ width: 140, fontSize: 13, fontWeight: 600, color: "#374151" }}>{s.staff}</div>
                  <div style={{ flex: 1, height: 10, background: "#f3f4f6", borderRadius: 5, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: s.color, borderRadius: 5 }} />
                  </div>
                  <div style={{ width: 36, fontSize: 13, fontWeight: 700, color: s.color, textAlign: "right" }}>{pct}%</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", width: 50 }}>{s.done}/{s.total}명</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showModal && selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 500, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ background: "#f0fdf4", color: "#16a34a", borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 800 }}>종합소득세</span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>No. {selected.no}</span>
            </div>
            <h2 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 800, color: "#111827" }}>{selected.name}</h2>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 18 }}>담당: {selected.staff}</div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 8 }}>신고 단계</label>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {STAGES.map((s, i) => {
                  const sc = STAGE_COLOR[s];
                  const active = editStage === s;
                  return (
                    <button key={s} onClick={() => setEditStage(s)}
                      style={{ padding: "7px 13px", borderRadius: 8, border: `2px solid ${active ? sc.dot : "#e5e7eb"}`, background: active ? sc.bg : "#fff", color: active ? sc.text : "#6b7280", fontWeight: active ? 700 : 400, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 16, height: 16, borderRadius: "50%", background: active ? sc.dot : "#e5e7eb", display: "inline-flex", alignItems: "center", justifyContent: "center", color: active ? "#fff" : "#9ca3af", fontSize: 9, fontWeight: 900, flexShrink: 0 }}>{i+1}</span>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 7 }}>메모</label>
              <textarea value={editMemo} onChange={e => setEditMemo(e.target.value)} rows={3} placeholder="특이사항 입력..."
                style={{ width: "100%", borderRadius: 8, border: "1px solid #d1d5db", padding: "9px 12px", fontSize: 13, resize: "none", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", fontSize: 14, cursor: "pointer" }}>취소</button>
              <button onClick={save} style={{ flex: 2, padding: "11px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #1a2e1a, #2d5a27)", color: "#fff", fontSize: 14, cursor: "pointer", fontWeight: 700 }}>저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
