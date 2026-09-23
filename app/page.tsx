"use client";

import Link from "next/link";
import { useI18n, type Locale } from "@/lib/i18n";

type UiLang = "kr" | "cn" | "en";

const localeToUi: Record<Locale, UiLang> = { ko: "kr", zh: "cn", en: "en" };
const uiToLocale: Record<UiLang, Locale> = { kr: "ko", cn: "zh", en: "en" };

function serviceHref(subItem: string) {
  return `/services/${subItem}`;
}

const copy = {
  kr: {
    tab1: "2. 비즈니스·인허가",
    tab2: "3. 노무·세무 자문",
    tab3: "1. 폐업처리 절차",
    tab4: "4. 문제해결 데스크",
    tab6: "🚨 5. 긴급 SOS",
    b1Title: "2. 비즈니스 컨설팅 및 인허가",
    b1Lead: "베트남 투자 및 법인 설립을 위한 필수 행정 서비스",
    irc: "IRC & ERC",
    ircDesc: "투자 및 사업자 등록증 발급·변경",
    license: "업종별 라이선스",
    licenseDesc: "수입 유통, 식품위생, 공장설립",
    branch: "지사 설립",
    branchDesc: "연락사무소 및 법인 설립 대행",
    b2Title: "3. 법률 및 노무·세무 자문",
    b2Lead: "현지 노동법 준수 및 세무·회계 리스크 관리",
    labor: "노무 및 계약서",
    laborDesc: "취업규칙, 근로계약서 검토",
    visa: "비자 & 노동허가",
    visaDesc: "WP, TRC 및 체류 비자 대행",
    tax: "세무 및 감사",
    taxDesc: "월별 세무신고 및 회계 감사 대응",
    b3Title: "1. 폐업처리 절차",
    b3Lead: "베트남 법인 및 지사 폐업, 청산 리스크 관리",
    closeIndustry: "업종별 폐업",
    closeIndustryDesc: "제조업, 유통업 등 업종별 청산 절차",
    closeStale: "오래 폐업처리 안된 기업",
    closeStaleDesc: "방치된 법인 세무정리 및 소급 해결",
    closeBlocked: "폐업처리안되는 기업",
    closeBlockedDesc: "세무 미결제 및 행정 제재 법인 대응",
    b4Title: "4. 실시간 문제 해결 데스크",
    b4Lead: "관공서 마찰 및 돌발 비즈니스 분쟁 신속 대응",
    admin: "행정·단속 마찰",
    adminDesc: "관공서 공문 및 돌발 방문 대응",
    consult: "1:1 맞춤 진단",
    consultDesc: "전문가 사전 진단 및 해결 플랜",
    sosTitle: "5. 지금 도움이 필요할 때",
    sosLead: "공안단속, 행정마찰, 비자·체류 문제를 신속하게 접수하고 전문가와 연결하세요.",
    sosCta: "🚨 긴급 SOS 접수하기",
  },
  cn: {
    tab1: "2. 商务·许可",
    tab2: "3. 劳务·税务咨询",
    tab3: "1. 注销/关停",
    tab4: "4. 问题处理台",
    tab6: "🚨 5. 紧急SOS",
    b1Title: "2. 商务咨询与许可",
    b1Lead: "越南投资及法人设立所需的核心行政服务",
    irc: "IRC & ERC",
    ircDesc: "投资与营业执照核发·变更",
    license: "行业许可证",
    licenseDesc: "进口流通、食品卫生、工厂设立",
    branch: "分支机构设立",
    branchDesc: "代表处及法人设立代办",
    b2Title: "3. 法律及劳务·税务咨询",
    b2Lead: "遵守当地劳动法并管理税务·会计风险",
    labor: "劳务及合同",
    laborDesc: "就业规则、劳动合同审阅",
    visa: "签证 & 劳动许可",
    visaDesc: "WP、TRC及居留签证代办",
    tax: "税务及审计",
    taxDesc: "月度税务申报及会计审计应对",
    b3Title: "1. 注销与关停手续",
    b3Lead: "越南法人及分支机构关停、清算风险管理",
    closeIndustry: "按行业关停",
    closeIndustryDesc: "制造业、流通业等行业清算流程",
    closeStale: "长期未完成关停的企业",
    closeStaleDesc: "闲置法人税务清理与追溯处理",
    closeBlocked: "无法关停的企业",
    closeBlockedDesc: "税务未结及行政处罚法人应对",
    b4Title: "4. 实时问题解决台",
    b4Lead: "快速应对行政机关摩擦与突发商业纠纷",
    admin: "行政·检查摩擦",
    adminDesc: "机关公文及突击检查应对",
    consult: "1对1诊断",
    consultDesc: "专家预诊与解决方案",
    sosTitle: "5. 现在就需要帮助时",
    sosLead: "快速提交公安检查、行政摩擦、签证居留问题，并对接专家。",
    sosCta: "🚨 提交紧急SOS",
  },
  en: {
    tab1: "2. Business & licensing",
    tab2: "3. Labor & tax advisory",
    tab3: "1. Closure procedure",
    tab4: "4. Issue desk",
    tab6: "🚨 5. Emergency SOS",
    b1Title: "2. Business consulting & licensing",
    b1Lead: "Essential admin services for Vietnam investment and company setup",
    irc: "IRC & ERC",
    ircDesc: "Investment and enterprise registration issue & change",
    license: "Industry licenses",
    licenseDesc: "Import, food hygiene, factory setup",
    branch: "Branch setup",
    branchDesc: "Rep office and legal entity setup",
    b2Title: "3. Legal, labor & tax advisory",
    b2Lead: "Local labor-law compliance and tax/audit risk control",
    labor: "Labor & contracts",
    laborDesc: "Work rules and employment contracts",
    visa: "Visa & work permit",
    visaDesc: "WP, TRC and residence visa filing",
    tax: "Tax & audit",
    taxDesc: "Monthly tax filing and audit response",
    b3Title: "1. Closure procedure",
    b3Lead: "Vietnam entity/branch shutdown and liquidation risk control",
    closeIndustry: "Industry-specific closure",
    closeIndustryDesc: "Manufacturing, trading and other sector wind-down",
    closeStale: "Long-dormant companies",
    closeStaleDesc: "Back-tax cleanup for neglected entities",
    closeBlocked: "Companies that cannot close",
    closeBlockedDesc: "Unpaid tax and administrative sanctions",
    b4Title: "4. Real-time issue desk",
    b4Lead: "Fast response to inspection friction and sudden disputes",
    admin: "Inspection friction",
    adminDesc: "Official notices and surprise visits",
    consult: "1:1 Diagnosis",
    consultDesc: "Expert pre-check and action plan",
    sosTitle: "5. When you need help now",
    sosLead: "File police, admin, or visa issues quickly and connect with an expert.",
    sosCta: "🚨 Submit Emergency SOS",
  },
};

export default function Home() {
  const { locale, setLocale } = useI18n();
  const lang = localeToUi[locale];
  const t = copy[lang];

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-100 pb-24 text-slate-800">
      <div className="fixed top-0 left-1/2 z-50 w-full max-w-xl -translate-x-1/2 bg-slate-900 shadow-md">
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 text-white">
          <h1 className="text-xl font-black tracking-wider text-blue-400">VLaw</h1>
          <div className="flex gap-1.5 text-xs font-semibold">
            {(["kr", "cn", "en"] as UiLang[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLocale(uiToLocale[code])}
                className={`rounded px-2.5 py-1 transition ${
                  lang === code
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {code === "kr" ? "한국어" : code === "cn" ? "中文" : "English"}
              </button>
            ))}
            <Link
              href="/expert/guides"
              className="rounded bg-blue-600 px-2.5 py-1 text-xs font-bold text-white transition hover:bg-blue-700"
            >
              ⚙️
            </Link>
          </div>
        </header>
        <nav className="flex gap-2 overflow-x-auto whitespace-nowrap border-b border-slate-800 bg-slate-900/95 px-3 py-2.5 backdrop-blur scrollbar-thin">
          <a
            href="#block-3"
            className="inline-block shrink-0 rounded-lg border border-purple-800/60 bg-purple-950/80 px-3 py-1.5 text-xs font-bold text-purple-300 transition hover:bg-purple-900"
          >
            {t.tab3}
          </a>
          <a
            href="#block-1"
            className="inline-block shrink-0 rounded-lg border border-blue-800/60 bg-blue-950/80 px-3 py-1.5 text-xs font-bold text-blue-300 transition hover:bg-blue-900"
          >
            {t.tab1}
          </a>
          <a
            href="#block-2"
            className="inline-block shrink-0 rounded-lg border border-indigo-800/60 bg-indigo-950/80 px-3 py-1.5 text-xs font-bold text-indigo-300 transition hover:bg-indigo-900"
          >
            {t.tab2}
          </a>
          <a
            href="#block-4"
            className="inline-block shrink-0 rounded-lg border border-amber-800/60 bg-amber-950/80 px-3 py-1.5 text-xs font-bold text-amber-300 transition hover:bg-amber-900"
          >
            {t.tab4}
          </a>
          <a
            href="#block-6"
            className="inline-block shrink-0 animate-pulse rounded-lg border border-red-800 bg-red-950 px-3 py-1.5 text-xs font-bold text-red-300 transition hover:bg-red-900"
          >
            {t.tab6}
          </a>
        </nav>
      </div>

      <main className="w-full max-w-xl space-y-5 p-4 pt-[135px]">
        <div className="grid grid-cols-2 gap-2.5">
          <a
            href="https://play.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs transition hover:bg-slate-50"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🤖</span>
              <div>
                <div className="text-[10px] font-medium text-slate-400">Android</div>
                <div className="text-xs font-black text-slate-800">삼성 안드로이드 앱</div>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600">다운로드 →</span>
          </a>
          <a
            href="https://www.apple.com/app-store/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs transition hover:bg-slate-50"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🍏</span>
              <div>
                <div className="text-[10px] font-medium text-slate-400">iOS</div>
                <div className="text-xs font-black text-slate-800">아이폰 앱</div>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600">다운로드 →</span>
          </a>
        </div>

        <p className="py-1.5 pl-[21px] text-left text-xl font-bold tracking-tight text-blue-900">
          전문 폐업처리 법률법인
        </p>

        <section id="block-3" className="scroll-mt-[140px] rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <span className="h-5 w-2 rounded-full bg-purple-600" />
            <h2 className="text-lg font-bold text-slate-900">{t.b3Title}</h2>
          </div>
          <p className="mb-4 pl-4 text-xs text-slate-500">{t.b3Lead}</p>
          <div className="no-scrollbar flex items-stretch gap-3 overflow-x-auto pb-2">
            <Link
              href={serviceHref("업종별 폐업")}
              className="flex w-[150px] min-w-[150px] flex-col justify-between rounded-xl border border-purple-200/60 bg-purple-50/70 p-3.5 shadow-xs transition hover:bg-purple-100"
            >
              <div>
                <span className="text-xl">🏢</span>
                <h3 className="mt-2 text-sm font-bold text-purple-950">{t.closeIndustry}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{t.closeIndustryDesc}</p>
              </div>
            </Link>
            <Link
              href={serviceHref("오래 폐업처리 안된 기업")}
              className="flex w-[150px] min-w-[150px] flex-col justify-between rounded-xl border border-purple-200/60 bg-purple-50/70 p-3.5 shadow-xs transition hover:bg-purple-100"
            >
              <div>
                <span className="text-xl">⏳</span>
                <h3 className="mt-2 text-sm font-bold text-purple-950">{t.closeStale}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{t.closeStaleDesc}</p>
              </div>
            </Link>
            <Link
              href={serviceHref("폐업처리안되는 기업")}
              className="flex w-[150px] min-w-[150px] flex-col justify-between rounded-xl border border-purple-200/60 bg-purple-50/70 p-3.5 shadow-xs transition hover:bg-purple-100"
            >
              <div>
                <span className="text-xl">⚠️</span>
                <h3 className="mt-2 text-sm font-bold text-purple-950">{t.closeBlocked}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{t.closeBlockedDesc}</p>
              </div>
            </Link>
          </div>
        </section>

        <section id="block-1" className="scroll-mt-[140px] rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <span className="h-5 w-2 rounded-full bg-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">{t.b1Title}</h2>
          </div>
          <p className="mb-4 pl-4 text-xs text-slate-500">{t.b1Lead}</p>
          <div className="no-scrollbar flex items-stretch gap-3 overflow-x-auto pb-2">
            <Link
              href={serviceHref("IRC & ERC")}
              className="flex w-[150px] min-w-[150px] flex-col justify-between rounded-xl border border-blue-200/60 bg-blue-50/70 p-3.5 shadow-xs transition hover:bg-blue-100"
            >
              <div>
                <span className="text-xl">📄</span>
                <h3 className="mt-2 text-sm font-bold text-blue-950">{t.irc}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{t.ircDesc}</p>
              </div>
            </Link>
            <Link
              href={serviceHref("업종별 라이선스")}
              className="flex w-[150px] min-w-[150px] flex-col justify-between rounded-xl border border-blue-200/60 bg-blue-50/70 p-3.5 shadow-xs transition hover:bg-blue-100"
            >
              <div>
                <span className="text-xl">🏭</span>
                <h3 className="mt-2 text-sm font-bold text-blue-950">{t.license}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{t.licenseDesc}</p>
              </div>
            </Link>
            <Link
              href={serviceHref("지사 설립")}
              className="flex w-[150px] min-w-[150px] flex-col justify-between rounded-xl border border-blue-200/60 bg-blue-50/70 p-3.5 shadow-xs transition hover:bg-blue-100"
            >
              <div>
                <span className="text-xl">🤝</span>
                <h3 className="mt-2 text-sm font-bold text-blue-950">{t.branch}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{t.branchDesc}</p>
              </div>
            </Link>
          </div>
        </section>

        <section id="block-2" className="scroll-mt-[140px] rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <span className="h-5 w-2 rounded-full bg-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">{t.b2Title}</h2>
          </div>
          <p className="mb-4 pl-4 text-xs text-slate-500">{t.b2Lead}</p>
          <div className="no-scrollbar flex items-stretch gap-3 overflow-x-auto pb-2">
            <Link
              href={serviceHref("노무 및 근로계약")}
              className="flex w-[150px] min-w-[150px] flex-col justify-between rounded-xl border border-indigo-200/60 bg-indigo-50/70 p-3.5 shadow-xs transition hover:bg-indigo-100"
            >
              <div>
                <span className="text-xl">📝</span>
                <h3 className="mt-2 text-sm font-bold text-indigo-950">{t.labor}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{t.laborDesc}</p>
              </div>
            </Link>
            <Link
              href={serviceHref("비자 및 노동허가서")}
              className="flex w-[150px] min-w-[150px] flex-col justify-between rounded-xl border border-indigo-200/60 bg-indigo-50/70 p-3.5 shadow-xs transition hover:bg-indigo-100"
            >
              <div>
                <span className="text-xl">🛂</span>
                <h3 className="mt-2 text-sm font-bold text-indigo-950">{t.visa}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{t.visaDesc}</p>
              </div>
            </Link>
            <Link
              href={serviceHref("세무 및 회계 감사")}
              className="flex w-[150px] min-w-[150px] flex-col justify-between rounded-xl border border-indigo-200/60 bg-indigo-50/70 p-3.5 shadow-xs transition hover:bg-indigo-100"
            >
              <div>
                <span className="text-xl">📊</span>
                <h3 className="mt-2 text-sm font-bold text-indigo-950">{t.tax}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{t.taxDesc}</p>
              </div>
            </Link>
          </div>
        </section>

        <section id="block-4" className="scroll-mt-[140px] rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <span className="h-5 w-2 rounded-full bg-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">{t.b4Title}</h2>
          </div>
          <p className="mb-4 pl-4 text-xs text-slate-500">{t.b4Lead}</p>
          <div className="no-scrollbar flex items-stretch gap-3 overflow-x-auto pb-2">
            <Link
              href={serviceHref("관공서 실사 마찰 대응")}
              className="flex w-[150px] min-w-[150px] flex-col justify-between rounded-xl border border-amber-200/60 bg-amber-50/70 p-3.5 shadow-xs transition hover:bg-amber-100"
            >
              <div>
                <span className="text-xl">🚨</span>
                <h3 className="mt-2 text-sm font-bold text-amber-950">{t.admin}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{t.adminDesc}</p>
              </div>
            </Link>
            <Link
              href={serviceHref("1:1 긴급 진단")}
              className="flex w-[150px] min-w-[150px] flex-col justify-between rounded-xl border border-amber-200/60 bg-amber-50/70 p-3.5 shadow-xs transition hover:bg-amber-100"
            >
              <div>
                <span className="text-xl">💬</span>
                <h3 className="mt-2 text-sm font-bold text-amber-950">{t.consult}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{t.consultDesc}</p>
              </div>
            </Link>
          </div>
        </section>

        <section
          id="block-6"
          className="scroll-mt-[140px] rounded-2xl border-2 border-red-300 bg-gradient-to-br from-red-50 to-red-100/60 p-5 shadow-md"
        >
          <div className="mb-2 flex items-start justify-between">
            <div>
              <span className="rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-white">
                EMERGENCY SOS
              </span>
              <h2 className="mt-1 text-xl font-black text-red-900">{t.sosTitle}</h2>
            </div>
          </div>
          <p className="mb-4 text-xs font-medium leading-relaxed text-red-800/90">{t.sosLead}</p>
          <Link
            href={serviceHref("긴급 SOS 신청하기")}
            className="block w-full rounded-xl bg-red-600 py-3.5 text-center text-sm font-bold tracking-wide text-white shadow-md transition hover:bg-red-700"
          >
            {t.sosCta}
          </Link>
        </section>
      </main>
    </div>
  );
}
