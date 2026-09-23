"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProgressBar from "@/components/ProgressBar";
import { listExperts } from "@/lib/experts";
import { assignExpert, listTickets, updateTicketStatus } from "@/lib/tickets";
import { TICKET_STATUSES, type EmergencyTicket, type Expert, type TicketStatus } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

const STATUS_LABEL: Record<
  TicketStatus,
  "stepReceived" | "stepAssigned" | "stepInProgress" | "stepResolved"
> = {
  접수완료: "stepReceived",
  담당자배정: "stepAssigned",
  관공서진행중: "stepInProgress",
  해결완료: "stepResolved",
};

export default function ExpertDashboardPage() {
  const { t } = useI18n();
  const [tickets, setTickets] = useState<EmergencyTicket[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);

  async function refresh() {
    const [nextTickets, nextExperts] = await Promise.all([listTickets(), listExperts()]);
    setTickets(nextTickets);
    setExperts(nextExperts);
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[#0B1F3A]">{t.expertTitle}</h1>
      <p className="text-sm text-slate-600">{t.expertLead}</p>
      <Link href="/expert/guides" className="inline-block text-sm font-semibold text-blue-700 hover:underline">
        가이드 콘텐츠 관리 →
      </Link>
      {tickets.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">
          {t.expertEmpty}
        </div>
      ) : (
        <ul className="space-y-4">
          {tickets.map((item) => (
            <li key={item.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm text-slate-500">{item.id}</p>
                  <h2 className="text-lg font-semibold">{item.reporter_name || t.unassigned}</h2>
                  <p className="text-sm text-slate-600">
                    {item.reporter_phone} {item.company_name ? `· ${item.company_name}` : ""} · {item.location}
                  </p>
                  <p className="mt-1 text-xs font-medium text-[#0B1F3A]">{item.category}</p>
                  <p className="mt-2 text-sm">{item.description}</p>
                </div>
              </div>
              {item.media_urls?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.media_urls.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-700 underline"
                    >
                      media
                    </a>
                  ))}
                </div>
              ) : null}
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <ProgressBar currentStatus={item.status} />
                <div className="space-y-3">
                  <label className="block text-sm font-medium">
                    {t.assignExpert}
                    <select
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                      value={item.assigned_expert_id ?? ""}
                      onChange={async (e) => {
                        if (!e.target.value) return;
                        await assignExpert(item.id, e.target.value);
                        await refresh();
                      }}
                    >
                      <option value="">{t.unassigned}</option>
                      {experts.map((expert) => (
                        <option key={expert.id} value={expert.id}>
                          {expert.name} · {expert.specialty}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-medium">
                    {t.updateStatus}
                    <select
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                      value={item.status}
                      onChange={async (e) => {
                        await updateTicketStatus(item.id, e.target.value as TicketStatus);
                        await refresh();
                      }}
                    >
                      {TICKET_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {t[STATUS_LABEL[status]]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
