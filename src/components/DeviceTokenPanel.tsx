"use client";

import { useState, useTransition } from "react";
import { createDeviceToken, revokeDeviceToken } from "@/app/(main)/settings/connections/actions";

type TokenRow = {
  id: string;
  label: string | null;
  createdAt: string;
  lastUsedAt: string | null;
};

export function DeviceTokenPanel({ tokens }: { tokens: TokenRow[] }) {
  const [newToken, setNewToken] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-3">
      {newToken && (
        <div className="rounded border border-amber-400 bg-amber-50 p-3 text-xs dark:border-amber-700 dark:bg-amber-950">
          <p className="mb-1.5 font-medium text-amber-700 dark:text-amber-300">
            이 토큰은 다시 표시되지 않습니다. 지금 복사해서 iOS 앱 설정 화면에 붙여넣으세요.
          </p>
          <code className="block break-all rounded bg-white px-2 py-1.5 dark:bg-zinc-900">{newToken}</code>
        </div>
      )}

      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const token = await createDeviceToken("iOS App");
            setNewToken(token);
          })
        }
        className="self-start rounded bg-orange-500 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "발급 중..." : "토큰 발급"}
      </button>

      {tokens.length > 0 && (
        <ul className="flex flex-col gap-1.5 text-xs text-zinc-500">
          {tokens.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 rounded border border-zinc-200 px-2.5 py-1.5 dark:border-zinc-800">
              <span>
                {t.label ?? "Device"} · 발급 {new Date(t.createdAt).toLocaleDateString("ko-KR")}
                {t.lastUsedAt && ` · 마지막 사용 ${new Date(t.lastUsedAt).toLocaleDateString("ko-KR")}`}
              </span>
              <form action={revokeDeviceToken.bind(null, t.id)}>
                <button type="submit" className="shrink-0 text-rose-500 underline">
                  폐기
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
