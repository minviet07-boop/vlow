"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "ko" | "zh" | "en";

const STORAGE_KEY = "vlaw_locale";

export const dictionaries = {
  ko: {
    brand: "VLaw",
    tagline: "이주노동자를 위한 긴급 법률 지원",
    langKo: "한국어",
    langZh: "中文",
    langEn: "English",
    home: "홈",
    sos: "긴급 SOS",
    tracking: "진행 상황",
    vault: "문서 보관함",
    expert: "전문가",
    dashboardTitle: "도움이 필요할 때, 바로 연결합니다",
    dashboardLead:
      "공안단속, 행정마찰, 비자·체류 문제를 접수하고 전문가와 연결하세요.",
    sosCta: "긴급 SOS 접수",
    sosHint: "위험 상황이면 먼저 112 / 119에 연락하세요.",
    menuSos: "긴급 접수",
    menuSosDesc: "사건 유형과 위치를 알려주세요",
    menuTrack: "실시간 추적",
    menuTrackDesc: "접수부터 해결까지 타임라인",
    menuVault: "암호화 보관함",
    menuVaultDesc: "여권·사업자·계약서를 안전하게",
    menuExpert: "전문가 대시보드",
    menuExpertDesc: "접수 건 확인 및 배정",
    sosTitle: "긴급 SOS 접수",
    sosLead: "입력한 연락처로 상담사가 연결됩니다. 가능한 한 구체적으로 적어 주세요.",
    fieldName: "이름 (가명 가능)",
    fieldPhone: "연락처",
    fieldCompany: "사업장 / 회사명",
    fieldLocation: "현재 위치 / 사업장",
    fieldCategory: "사건 유형",
    fieldDescription: "상황 설명",
    fieldMedia: "증거 사진·영상",
    catPolice: "공안단속",
    catAdmin: "행정마찰",
    catVisa: "비자/체류",
    catOther: "기타",
    submit: "접수하기",
    submitting: "접수 중…",
    required: "필수 항목입니다",
    trackingTitle: "실시간 진행 상황",
    trackingLead: "접수번호로 처리 단계를 확인하세요.",
    trackingEmpty: "아직 접수된 사건이 없습니다.",
    goSos: "SOS 접수하기",
    caseId: "접수번호",
    assignedTo: "담당 전문가",
    unassigned: "미배정",
    vaultTitle: "암호화된 문서 보관함",
    vaultLead: "여권, 사업자등록증, 비자/TRC, 계약서를 Storage에 보관합니다.",
    vaultUpload: "파일 추가",
    vaultEmpty: "보관된 문서가 없습니다.",
    vaultDelete: "삭제",
    fieldDocType: "문서 종류",
    docPassport: "여권",
    docBiz: "사업자등록증",
    docVisa: "비자/TRC",
    docContract: "계약서",
    expertTitle: "전문가 접수 관리",
    expertLead: "접수된 SOS를 확인하고 담당자와 진행 단계를 업데이트하세요.",
    expertEmpty: "대기 중인 접수가 없습니다.",
    updateStatus: "상태 변경",
    assignExpert: "담당자 배정",
    stepReceived: "접수완료",
    stepAssigned: "담당자배정",
    stepInProgress: "관공서진행중",
    stepResolved: "해결완료",
    footer: "긴급 상황에서는 112(경찰) / 119(소방)를 우선 이용하세요.",
  },
  zh: {
    brand: "VLaw",
    tagline: "为跨境经营者提供紧急法律支持",
    langKo: "한국어",
    langZh: "中文",
    langEn: "English",
    home: "首页",
    sos: "紧急SOS",
    tracking: "进度",
    vault: "文件保管箱",
    expert: "专家",
    dashboardTitle: "需要帮助时，立即连接",
    dashboardLead: "快速提交公安检查、行政摩擦、签证居留问题，并对接专家。",
    sosCta: "提交紧急SOS",
    sosHint: "如有人身危险，请先拨打当地紧急电话。",
    menuSos: "紧急受理",
    menuSosDesc: "告知案件类型和位置",
    menuTrack: "实时追踪",
    menuTrackDesc: "从受理到结案的时间线",
    menuVault: "加密保管箱",
    menuVaultDesc: "安全保存护照、执照和合同",
    menuExpert: "专家工作台",
    menuExpertDesc: "查看并分派案件",
    sosTitle: "紧急SOS表单",
    sosLead: "顾问将通过您提供的电话联系。请尽量写清楚。",
    fieldName: "姓名（可用化名）",
    fieldPhone: "电话",
    fieldCompany: "公司 / 经营场所",
    fieldLocation: "当前位置 / 经营场所",
    fieldCategory: "案件类型",
    fieldDescription: "情况说明",
    fieldMedia: "证据照片/视频",
    catPolice: "公安检查",
    catAdmin: "行政摩擦",
    catVisa: "签证/居留",
    catOther: "其他",
    submit: "提交",
    submitting: "提交中…",
    required: "此项为必填",
    trackingTitle: "实时进度",
    trackingLead: "用受理编号查看处理阶段。",
    trackingEmpty: "还没有案件。",
    goSos: "提交SOS",
    caseId: "受理编号",
    assignedTo: "负责专家",
    unassigned: "未分派",
    vaultTitle: "加密文件保管箱",
    vaultLead: "将护照、营业执照、签证/TRC和合同存入Storage。",
    vaultUpload: "添加文件",
    vaultEmpty: "暂无文件。",
    vaultDelete: "删除",
    fieldDocType: "文件类型",
    docPassport: "护照",
    docBiz: "营业执照",
    docVisa: "签证/TRC",
    docContract: "合同",
    expertTitle: "专家案件台",
    expertLead: "查看SOS并更新负责人和阶段。",
    expertEmpty: "暂无待处理案件。",
    updateStatus: "更改状态",
    assignExpert: "分派专家",
    stepReceived: "已受理",
    stepAssigned: "已分派",
    stepInProgress: "政府部门办理中",
    stepResolved: "已解决",
    footer: "紧急情况请优先拨打当地报警/急救电话。",
  },
  en: {
    brand: "VLaw",
    tagline: "Emergency legal aid for migrant workers",
    langKo: "한국어",
    langZh: "中文",
    langEn: "English",
    home: "Home",
    sos: "Emergency SOS",
    tracking: "Tracking",
    vault: "Document vault",
    expert: "Expert",
    dashboardTitle: "When you need help, connect immediately",
    dashboardLead:
      "Report police crackdowns, admin disputes, or visa issues and get linked to an expert.",
    sosCta: "Submit emergency SOS",
    sosHint: "If you are in danger, call 112 / 119 first.",
    menuSos: "Urgent intake",
    menuSosDesc: "Tell us the case type and location",
    menuTrack: "Live tracking",
    menuTrackDesc: "Timeline from intake to resolution",
    menuVault: "Encrypted vault",
    menuVaultDesc: "Keep passport, business, and contracts safe",
    menuExpert: "Expert dashboard",
    menuExpertDesc: "Review and assign incoming cases",
    sosTitle: "Emergency SOS form",
    sosLead: "A counselor will reach you at the number you provide. Be as specific as you can.",
    fieldName: "Name (alias allowed)",
    fieldPhone: "Phone",
    fieldCompany: "Company / workplace",
    fieldLocation: "Current location / workplace",
    fieldCategory: "Case type",
    fieldDescription: "What happened",
    fieldMedia: "Evidence photos / video",
    catPolice: "Police crackdown",
    catAdmin: "Admin dispute",
    catVisa: "Visa / stay",
    catOther: "Other",
    submit: "Submit",
    submitting: "Submitting…",
    required: "This field is required",
    trackingTitle: "Live progress",
    trackingLead: "Check processing steps with your case number.",
    trackingEmpty: "No cases yet.",
    goSos: "Submit SOS",
    caseId: "Case ID",
    assignedTo: "Assigned expert",
    unassigned: "Unassigned",
    vaultTitle: "Encrypted document vault",
    vaultLead: "Store passports, business licenses, visa/TRC, and contracts in Storage.",
    vaultUpload: "Add file",
    vaultEmpty: "No documents stored.",
    vaultDelete: "Delete",
    fieldDocType: "Document type",
    docPassport: "Passport",
    docBiz: "Business license",
    docVisa: "Visa/TRC",
    docContract: "Contract",
    expertTitle: "Expert case desk",
    expertLead: "Review SOS submissions and update the assignee and stage.",
    expertEmpty: "No pending cases.",
    updateStatus: "Update status",
    assignExpert: "Assign expert",
    stepReceived: "Received",
    stepAssigned: "Expert assigned",
    stepInProgress: "At government office",
    stepResolved: "Resolved",
    footer: "In an emergency, call 112 (police) / 119 (fire & rescue) first.",
  },
} as const;

type Dictionary = (typeof dictionaries)[Locale];

type I18nContextValue = {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ko");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "ko" || saved === "zh" || saved === "en") {
      setLocaleState(saved);
    } else if (saved === "vi") {
      setLocaleState("zh");
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(
    () => ({ locale, t: dictionaries[locale], setLocale }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
