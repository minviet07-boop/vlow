"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { KAKAO_CHANNEL_URL, displayNameForSlug, loadPostsForSlug, type GuidePost } from "@/lib/guides";

function parseImageToHtml(text: unknown) {
  if (!text) return "";
  return String(text)
    .replace(
      /!\[(.*?)\]\((.*?)\)/g,
      '<img src="$2" alt="$1" style="max-width:100%; height:auto; display:block; margin:12px auto; border-radius:8px;" />',
    )
    .replace(/\n/g, "<br/>");
}

export default function ServiceGuidePage() {
  const params = useParams();
  const rawSlug = String(params?.slug ?? "");
  const subItemName = displayNameForSlug(rawSlug);
  const [postList, setPostList] = useState<GuidePost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rawSlug) return;
    let cancelled = false;
    setLoading(true);
    loadPostsForSlug(rawSlug).then((posts) => {
      if (cancelled) return;
      setPostList(posts);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [rawSlug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-xs text-slate-500">
        가이드 불러오는 중...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-100 pb-28 text-slate-800">
      <header className="fixed top-0 left-1/2 z-50 flex w-full max-w-xl -translate-x-1/2 items-center justify-between bg-slate-900 px-4 py-3 text-white shadow-md">
        <Link href="/" className="text-sm font-bold text-blue-400">
          ← 홈으로 돌아가기
        </Link>
        <span className="rounded-md bg-slate-800 px-2.5 py-1 text-xs text-slate-300">VLaw 공식 가이드</span>
      </header>

      <main className="w-full max-w-xl space-y-6 p-4 pt-20">
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <span className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800">전문가 검토 완료</span>
          <h1 className="text-xl font-black text-slate-900">{subItemName}</h1>
          <p className="text-xs leading-relaxed text-slate-500">
            변호사(관리자)가 등록한 모든 최신 가이드와 실무 절차 안내가 이 곳에 실시간으로 누적되어 제공됩니다.
          </p>
        </div>

        {postList.length === 0 ? (
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-bold text-slate-700">등록된 가이드 상세 내용이 없습니다.</p>
            <p className="text-xs text-slate-400">관리자 모드에서 새로운 가이드 글을 등록해 주세요.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {postList.map((post, postIndex) => (
              <div
                key={post.id || postIndex}
                className="relative space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      {post.createdAt} 발행
                    </span>
                  </div>
                  <h2
                    className="mt-1 text-lg font-black text-slate-900"
                    dangerouslySetInnerHTML={{ __html: parseImageToHtml(post.title) }}
                  />
                  <div
                    className="mt-2 text-xs leading-relaxed text-slate-600"
                    dangerouslySetInnerHTML={{ __html: parseImageToHtml(post.desc) }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
                  <div>
                    <span className="block font-medium text-slate-400">예상 소요 기간</span>
                    <span className="text-sm font-bold text-slate-800">{post.period}</span>
                  </div>
                  <div>
                    <span className="block font-medium text-slate-400">관할 행정기관</span>
                    <span className="text-sm font-bold text-blue-600">{post.authority}</span>
                  </div>
                </div>
                {post.steps && post.steps.length > 0 ? (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
                      📌 상세 절차 및 가이드
                    </h3>
                    {post.steps.map((item, index) => (
                      <div key={index} className="space-y-1 rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 text-xs">
                        <div
                          className="font-bold text-blue-950"
                          dangerouslySetInnerHTML={{ __html: `${item.stepNum}. ${parseImageToHtml(item.title)}` }}
                        />
                        <div
                          className="leading-relaxed text-slate-600"
                          dangerouslySetInnerHTML={{ __html: parseImageToHtml(item.desc) }}
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-xl -translate-x-1/2 border-t border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
        <a
          href={KAKAO_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] py-3.5 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-[#fdd800]"
        >
          <span className="text-base">💬</span>
          <span>전문가 카카오톡 대화하기</span>
        </a>
      </div>
    </div>
  );
}
