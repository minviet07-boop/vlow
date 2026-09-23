"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTicket, uploadTicketMedia } from "@/lib/tickets";
import type { TicketCategory } from "@/lib/types";

export default function SOSForm() {
  const router = useRouter();
  const [category, setCategory] = useState("공안단속");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const media_urls = file ? await uploadTicketMedia([file]) : [];
      const created = await createTicket({
        category: category as TicketCategory,
        location,
        description,
        media_urls,
      });
      alert("긴급 SOS가 접수되었습니다. 담당 전문가에게 실시간 알림이 발송됩니다.");
      router.push(`/tracking?id=${encodeURIComponent(created.id)}`);
    } catch {
      setError("접수에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 p-4 shadow-md"
    >
      <h2 className="mb-4 text-xl font-bold text-red-600">🚨 긴급 SOS 및 트러블슈팅 접수</h2>

      <div className="mb-3">
        <label className="mb-1 block text-sm font-semibold">상황 카테고리</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-md border bg-white p-2"
        >
          <option value="공안단속">공안 단속 / 돌발 방문</option>
          <option value="행정마찰">관공서 인허가/서류 마찰</option>
          <option value="비자체류">비자 및 체류(TRC) 긴급 문제</option>
          <option value="기타분쟁">기타 긴급 비즈니스 분쟁</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="mb-1 block text-sm font-semibold">현재 위치 (지역/구체적 주소)</label>
        <input
          type="text"
          placeholder="예: 호치민 7군 떤퐁 동 OO식당"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full rounded-md border bg-white p-2"
          required
        />
      </div>
      <div className="mb-3">
        <label className="mb-1 block text-sm font-semibold">상황 상세 설명</label>
        <textarea
          placeholder="현재 겪고 계신 상황을 간략히 적어주세요."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="h-24 w-full rounded-md border bg-white p-2"
          required
        />
      </div>
      <div className="mb-4">
        <label className="mb-1 block text-sm font-semibold">증거 사진/영상 첨부</label>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => e.target.files && setFile(e.target.files[0])}
          className="w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-red-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-red-700 hover:file:bg-red-200"
        />
      </div>
      {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-red-600 py-3 font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
      >
        {loading ? "접수 중..." : "긴급 구조 및 지원 요청하기"}
      </button>
    </form>
  );
}
