"use client";

import { useState, useEffect, useRef, type ChangeEvent } from "react";
import Link from "next/link";
import {
  GUIDE_CATEGORIES,
  readPosts,
  savePosts,
  type GuidePost,
  type AdminGuideStep,
} from "@/lib/guides";

const categories = [
  GUIDE_CATEGORIES.find((c) => c.id === "closure")!,
  GUIDE_CATEGORIES.find((c) => c.id === "business")!,
  GUIDE_CATEGORIES.find((c) => c.id === "labor")!,
  GUIDE_CATEGORIES.find((c) => c.id === "issue")!,
  GUIDE_CATEGORIES.find((c) => c.id === "sos")!,
];

type StepItem = AdminGuideStep;

function insertImageMarkdown(
  el: HTMLInputElement | HTMLTextAreaElement | null,
  value: string,
  setValue: (next: string) => void,
) {
  const url = window.prompt("이미지 URL을 입력하세요");
  if (!url?.trim()) return;
  const snippet = `![이미지](${url.trim()})`;
  const start = el?.selectionStart ?? value.length;
  const end = el?.selectionEnd ?? value.length;
  const next = `${value.slice(0, start)}${snippet}${value.slice(end)}`;
  setValue(next);
  requestAnimationFrame(() => {
    if (!el) return;
    const pos = start + snippet.length;
    el.focus();
    el.setSelectionRange(pos, pos);
  });
}

function insertSnippetAtCursor(
  el: HTMLInputElement | HTMLTextAreaElement | null,
  value: string,
  setValue: (next: string) => void,
  snippet: string,
) {
  const start = el?.selectionStart ?? value.length;
  const end = el?.selectionEnd ?? value.length;
  const next = `${value.slice(0, start)}${snippet}${value.slice(end)}`;
  setValue(next);
  requestAnimationFrame(() => {
    if (!el) return;
    const pos = start + snippet.length;
    el.focus();
    el.setSelectionRange(pos, pos);
  });
}

export default function ExpertGuidesAdmin() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [selectedSubItem, setSelectedSubItem] = useState(categories[0].subItems[0]);
  const [guideTitle, setGuideTitle] = useState("");
  const [guideDesc, setGuideDesc] = useState("");
  const [period, setPeriod] = useState("약 2 ~ 3주 소요");
  const [authority, setAuthority] = useState("관할 관공서");
  const [steps, setSteps] = useState<StepItem[]>([{ stepNum: "Step 1", title: "", desc: "" }]);
  const [postList, setPostList] = useState<GuidePost[]>([]);
  const [ready, setReady] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const stepDescRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileTargetRef = useRef<"title" | "desc" | number | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const formCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUnlocked(sessionStorage.getItem("vlaw_admin_ok") === "1");
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const posts = await readPosts(selectedSubItem);
      if (cancelled) return;
      setPostList(posts);
      setGuideTitle("");
      setGuideDesc("");
      setSteps([{ stepNum: "Step 1", title: "", desc: "" }]);
      setEditingId(null);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
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

  const handleAddNewPost = () => {
    if (!guideTitle.trim()) {
      alert("가이드 제목을 입력해주세요.");
      return;
    }
    const newPost: GuidePost = {
      id: Date.now().toString(),
      createdAt: new Date().toLocaleDateString("ko-KR"),
      title: guideTitle,
      desc: guideDesc,
      period,
      authority,
      steps,
    };
    const updatedList = [newPost, ...postList];
    setPostList(updatedList);
    savePosts(selectedSubItem, updatedList);
    alert(`[${selectedSubItem}]에 새로운 가이드가 추가(누적)되었습니다!`);
    setGuideTitle("");
    setGuideDesc("");
    setSteps([{ stepNum: "Step 1", title: "", desc: "" }]);
  };

  const handleDeletePost = (postId: string) => {
    if (!confirm("이 가이드 포스트를 삭제하시겠습니까?")) return;
    const updatedList = postList.filter((p) => p.id !== postId);
    setPostList(updatedList);
    savePosts(selectedSubItem, updatedList);
    alert("삭제되었습니다.");
  };

  const handleResetForm = () => {
    setEditingId(null);
    setGuideTitle("");
    setGuideDesc("");
    setPeriod("약 2 ~ 3주 소요");
    setAuthority("관할 관공서");
    setSteps([{ stepNum: "Step 1", title: "", desc: "" }]);
  };

  const handleStartEdit = (post: GuidePost) => {
    setEditingId(post.id);
    setGuideTitle(post.title);
    setGuideDesc(post.desc);
    setPeriod(post.period);
    setAuthority(post.authority);
    setSteps(
      post.steps && post.steps.length > 0
        ? post.steps.map((step) => ({ ...step }))
        : [{ stepNum: "Step 1", title: "", desc: "" }],
    );
    requestAnimationFrame(() => {
      formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleUpdatePost = () => {
    if (!editingId) return;
    if (!guideTitle.trim()) {
      alert("가이드 제목을 입력해주세요.");
      return;
    }
    const updatedList = postList.map((post) =>
      post.id === editingId
        ? {
            ...post,
            title: guideTitle,
            desc: guideDesc,
            period,
            authority,
            steps,
          }
        : post,
    );
    setPostList(updatedList);
    savePosts(selectedSubItem, updatedList);
    alert("가이드가 수정되었습니다.");
    handleResetForm();
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    const found = categories.find((c) => c.id === catId);
    if (found && found.subItems.length > 0) {
      setSelectedSubItem(found.subItems[0]);
    }
  };

  const openImageFilePicker = (target: "title" | "desc" | number) => {
    fileTargetRef.current = target;
    fileInputRef.current?.click();
  };

  const onImageFilePicked = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    const target = fileTargetRef.current;
    if (!file || target == null) return;
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 선택할 수 있습니다.");
      return;
    }
    const uploadKey = typeof target === "number" ? `step-${target}` : target;
    setUploading(uploadKey);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const raw = await res.text();
      let json: { url?: string; error?: string } = {};
      try {
        json = JSON.parse(raw) as { url?: string; error?: string };
      } catch {
        json = {};
      }
      if (!res.ok || !json.url) {
        throw new Error(json.error || raw || `업로드 실패 (${res.status})`);
      }
      const snippet = `![이미지](${json.url})`;
      if (target === "title") {
        const el = titleRef.current;
        insertSnippetAtCursor(el, el?.value ?? "", setGuideTitle, snippet);
      } else if (target === "desc") {
        const el = descRef.current;
        insertSnippetAtCursor(el, el?.value ?? "", setGuideDesc, snippet);
      } else {
        const el = stepDescRefs.current[target];
        insertSnippetAtCursor(el, el?.value ?? "", (next) => handleStepChange(target, "desc", next), snippet);
      }
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : String(error));
    } finally {
      setUploading(null);
    }
  };

  const currentCatObj = categories.find((c) => c.id === selectedCategory);

  const handleAdminUnlock = () => {
    if (password === "6789") {
      sessionStorage.setItem("vlaw_admin_ok", "1");
      setUnlocked(true);
      return;
    }
    alert("비밀번호가 올바르지 않습니다.");
  };

  if (!authChecked) {
    return <div className="min-h-screen bg-slate-100" />;
  }

  if (!unlocked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-4 text-slate-800">
        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-sm font-black text-slate-900">관리자 인증</h1>
          <p className="text-xs text-slate-500">비밀번호를 입력한 뒤 관리자 CMS에 진입하세요.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdminUnlock();
            }}
            placeholder="비밀번호"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium focus:border-blue-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAdminUnlock}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-700"
          >
            입장하기
          </button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return <div className="min-h-screen bg-slate-100" />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-100 pb-24 text-slate-800">
      <header className="fixed top-0 left-1/2 z-50 flex w-full max-w-2xl -translate-x-1/2 items-center justify-between bg-slate-900 px-4 py-3 text-white shadow-md">
        <Link href="/" className="text-sm font-bold text-blue-400">
          ← VLaw 홈으로 돌아가기
        </Link>
        <span className="rounded-md bg-blue-900 px-2.5 py-1 text-xs font-semibold text-blue-200">
          변호사 전용 다중 포스팅 CMS 모드
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
              2. 세부 항목 선택
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

        <div ref={formCardRef} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onImageFilePicked}
          />
          <div className="border-b border-slate-100 pb-3">
            <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
              {editingId ? "글 수정 중" : "새 포스트 작성"}
            </span>
            <h2 className="mt-1 text-base font-black text-slate-900">
              [{selectedSubItem}] {editingId ? "가이드 수정하기" : "새로운 가이드 추가하기"}
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {editingId
                ? "저장하면 이 글만 덮어쓰기 됩니다. 새 글로 돌아가려면 초기화를 누르세요."
                : "작성 후 저장하면 기존 글 아래에 차곡차곡 누적됩니다."}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">가이드 제목</label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertImageMarkdown(titleRef.current, guideTitle, setGuideTitle)}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  📷 이미지 URL 추가
                </button>
                <button
                  type="button"
                  disabled={uploading !== null}
                  onClick={() => openImageFilePicker("title")}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  {uploading === "title" ? "사진 업로드 중..." : "📁 이미지 파일 직접 선택"}
                </button>
              </div>
            </div>
            <input
              ref={titleRef}
              type="text"
              placeholder="예: 최신 행정 절차 안내"
              value={guideTitle}
              onChange={(e) => setGuideTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">상단 안내 문구 (요약 설명)</label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertImageMarkdown(descRef.current, guideDesc, setGuideDesc)}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  📷 이미지 URL 추가
                </button>
                <button
                  type="button"
                  disabled={uploading !== null}
                  onClick={() => openImageFilePicker("desc")}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  {uploading === "desc" ? "사진 업로드 중..." : "📁 이미지 파일 직접 선택"}
                </button>
              </div>
            </div>
            <textarea
              ref={descRef}
              rows={2}
              placeholder="전체 요약 설명 입력"
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
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        insertImageMarkdown(stepDescRefs.current[idx], step.desc, (next) =>
                          handleStepChange(idx, "desc", next),
                        )
                      }
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50"
                    >
                      📷 이미지 URL 추가
                    </button>
                    <button
                      type="button"
                      disabled={uploading !== null}
                      onClick={() => openImageFilePicker(idx)}
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                    >
                      {uploading === `step-${idx}` ? "사진 업로드 중..." : "📁 이미지 파일 직접 선택"}
                    </button>
                  </div>
                  <textarea
                    ref={(node) => {
                      stepDescRefs.current[idx] = node;
                    }}
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

          <div className="flex flex-col gap-2 pt-4">
            <button
              type="button"
              onClick={editingId ? handleUpdatePost : handleAddNewPost}
              className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700"
            >
              {editingId ? "수정 내용 저장하기" : "➕ 새로운 가이드 글 등록하기 (누적 저장)"}
            </button>
            <button
              type="button"
              onClick={handleResetForm}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
            >
              새 포스트 작성 / 초기화
            </button>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
            📚 [{selectedSubItem}] 누적 발행된 가이드 목록 ({postList.length}개)
          </h3>
          {postList.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-4 text-center text-xs text-slate-400">
              아직 등록된 가이드 글이 없습니다. 위 폼에서 새 글을 작성해 주세요.
            </p>
          ) : (
            <div className="space-y-3">
              {postList.map((post) => (
                <div
                  key={post.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="space-y-1">
                    <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {post.createdAt} 등록
                    </span>
                    <h4 className="mt-1 text-xs font-black text-slate-900">{post.title}</h4>
                    <p className="line-clamp-1 text-[11px] text-slate-500">{post.desc}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(post)}
                      className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                    >
                      ✏️ 수정
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.id)}
                      className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
