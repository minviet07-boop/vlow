"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  GUIDE_CATEGORIES,
  defaultItemGuide,
  deleteItemGuide,
  readItemGuide,
  saveItemGuide,
  type AdminGuideStep,
} from "@/lib/guides";

const categories = GUIDE_CATEGORIES;

function applyPayload(
  payload: {
    title: string;
    desc: string;
    period: string;
    authority: string;
    steps: AdminGuideStep[];
  },
  setGuideTitle: (v: string) => void,
  setGuideDesc: (v: string) => void,
  setPeriod: (v: string) => void,
  setAuthority: (v: string) => void,
  setSteps: (v: AdminGuideStep[]) => void,
) {
  setGuideTitle(payload.title || "");
  setGuideDesc(payload.desc || "");
  setPeriod(payload.period || "");
  setAuthority(payload.authority || "");
  setSteps(payload.steps || [{ stepNum: "Step 1", title: "", desc: "" }]);
}

export default function ExpertGuidesAdmin() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [selectedSubItem, setSelectedSubItem] = useState(categories[0].subItems[0]);
  const [guideTitle, setGuideTitle] = useState("");
  const [guideDesc, setGuideDesc] = useState("");
  const [period, setPeriod] = useState("");
  const [authority, setAuthority] = useState("");
  const [steps, setSteps] = useState<AdminGuideStep[]>([{ stepNum: "Step 1", title: "", desc: "" }]);

  useEffect(() => {
    const savedData = readItemGuide(selectedSubItem);
    if (savedData) {
      applyPayload(savedData, setGuideTitle, setGuideDesc, setPeriod, setAuthority, setSteps);
    } else {
      applyPayload(defaultItemGuide(selectedSubItem), setGuideTitle, setGuideDesc, setPeriod, setAuthority, setSteps);
    }
  }, [selectedSubItem]);

  const addStep = () => {
    setSteps([...steps, { stepNum: `Step ${steps.length + 1}`, title: "", desc: "" }]);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    const reindexed = newSteps.map((s, idx) => ({ ...s, stepNum: `Step ${idx + 1}` }));
    setSteps(reindexed);
  };

  const handleStepChange = (index: number, field: "title" | "desc", value: string) => {
    setSteps(steps.map((step, i) => (i === index ? { ...step, [field]: value } : step)));
  };

  const handleSave = () => {
    saveItemGuide({
      title: guideTitle,
      category: categories.find((c) => c.id === selectedCategory)?.name,
      subItem: selectedSubItem,
      desc: guideDesc,
      period,
      authority,
      steps,
    });
    alert(`[${selectedSubItem}] 내용이 성공적으로 저장되었습니다!\n소비자 상세 페이지에 실시간 반영됩니다.`);
  };

  const handleDelete = () => {
    if (!confirm(`정말 [${selectedSubItem}] 가이드 내용을 삭제하시겠습니까? 초기 상태로 되돌아갑니다.`)) {
      return;
    }
    deleteItemGuide(selectedSubItem);
    applyPayload(defaultItemGuide(selectedSubItem), setGuideTitle, setGuideDesc, setPeriod, setAuthority, setSteps);
    alert("성공적으로 삭제되었습니다.");
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    const found = categories.find((c) => c.id === catId);
    if (found && found.subItems.length > 0) {
      setSelectedSubItem(found.subItems[0]);
    }
  };

  const currentCatObj = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-100 pb-24 text-slate-800">
      <header className="fixed top-0 left-1/2 z-50 flex w-full max-w-2xl -translate-x-1/2 items-center justify-between bg-slate-900 px-4 py-3 text-white shadow-md">
        <Link href="/" className="text-sm font-bold text-blue-400">
          ← VLaw 홈으로 돌아가기
        </Link>
        <span className="rounded-md bg-blue-900 px-2.5 py-1 text-xs font-semibold text-blue-200">
          변호사 전용 가이드 관리자 모드
        </span>
      </header>

      <main className="w-full max-w-2xl space-y-6 p-4 pt-20">
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase">
            1. 대분류 카테고리 선택
          </label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`rounded-xl border p-3 text-left text-xs font-bold transition ${
                  selectedCategory === cat.id
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {currentCatObj ? (
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase">
              2. 수정할 세부 항목 선택
            </label>
            <div className="flex flex-wrap gap-2">
              {currentCatObj.subItems.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubItem(sub)}
                  className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
                    selectedSubItem === sub
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  📄 {sub}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                현재 편집 항목
              </span>
              <h2 className="mt-1 text-base font-black text-slate-900">[{selectedSubItem}] 가이드 내용 편집</h2>
            </div>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
            >
              🗑️ 내용 삭제
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">소비자 화면 노출 제목</label>
            <input
              type="text"
              value={guideTitle}
              onChange={(e) => setGuideTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">상단 안내 문구 (요약 설명)</label>
            <textarea
              rows={2}
              value={guideDesc}
              onChange={(e) => setGuideDesc(e.target.value)}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">예상 소요 기간</label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">관할 행정기관</label>
              <input
                type="text"
                value={authority}
                onChange={(e) => setAuthority(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold tracking-wider text-slate-700 uppercase">
                📌 단계별 절차 블록 관리
              </label>
              <button
                type="button"
                onClick={addStep}
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
              >
                + 스텝 추가하기
              </button>
            </div>
            {steps.map((step, idx) => (
              <div key={idx} className="relative space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-900">
                    {step.stepNum}
                  </span>
                  {steps.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      className="rounded px-2 py-1 text-xs font-bold text-red-500 hover:text-red-700"
                    >
                      삭제 ✕
                    </button>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="단계 제목"
                    value={step.title}
                    onChange={(e) => handleStepChange(idx, "title", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs font-bold focus:border-blue-500 focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    placeholder="단계별 상세 설명 문구 입력"
                    value={step.desc}
                    onChange={(e) => handleStepChange(idx, "desc", e.target.value)}
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={handleSave}
              className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700"
            >
              💾 변경 사항 저장 및 실시간 반영
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
