"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import ProgressBar from "@/components/ProgressBar";
import { getLastTicketId, getTicket } from "@/lib/tickets";
import type { EmergencyTicket } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

function TrackingInner() {
  const { t } = useI18n();
  const params = useSearchParams();
  const [item, setItem] = useState<EmergencyTicket | undefined>();

  useEffect(() => {
    const id = params.get("id") || getLastTicketId();
    if (!id) return;
    void getTicket(id).then(setItem);
  }, [params]);

  if (!item) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-slate-600">{t.trackingEmpty}</p>
        <Link
          href="/sos"
          className="mt-4 inline-block rounded-xl bg-[#DC2626] px-5 py-2.5 font-medium text-white"
        >
          {t.goSos}
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{t.caseId}</p>
      <p className="font-mono text-lg font-semibold">{item.id}</p>
      <p className="mt-2 text-sm text-slate-600">
        {item.category} · {item.location}
      </p>
      <p className="mt-1 text-sm">
        {t.assignedTo}: {item.assigned_expert?.name ?? t.unassigned}
      </p>
      <div className="mt-6">
        <ProgressBar currentStatus={item.status} />
      </div>
    </div>
  );
}

export default function TrackingPage() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold text-[#0B1F3A]">{t.trackingTitle}</h1>
      <p className="text-sm text-slate-600">{t.trackingLead}</p>
      <Suspense fallback={<p className="text-sm text-slate-500">…</p>}>
        <TrackingInner />
      </Suspense>
    </div>
  );
}
