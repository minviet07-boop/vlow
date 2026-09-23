"use client";

const steps = ["접수완료", "담당자배정", "관공서진행중", "해결완료"];

export default function ProgressBar({ currentStatus }: { currentStatus: string }) {
  const currentIndex = steps.indexOf(currentStatus);

  return (
    <div className="my-4 rounded-xl border bg-white p-4 shadow-md">
      <h3 className="mb-4 font-bold text-gray-700">📊 실시간 처리 진행 현황</h3>
      <div className="relative flex items-center justify-between">
        <div className="absolute top-4 right-8 left-8 h-0.5 bg-gray-200" />
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          return (
            <div key={step} className="z-10 flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  isCompleted ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`mt-2 text-xs ${
                  isCompleted ? "font-semibold text-blue-600" : "text-gray-400"
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
