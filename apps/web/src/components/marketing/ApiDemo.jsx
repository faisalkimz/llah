/**
 * ApiDemo: Side-by-side request/response panels showing real API usage.
 * Endpoints match the actual Llah API routes.
 */
export default function ApiDemo() {
  return (
    <div className="grid gap-4 lg:grid-cols-2" aria-label="API request and response example">
      {/* Request */}
      <div className="rounded-xl border border-neutral-800 bg-[#1e1e1e] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-neutral-700/50 px-4 py-2.5">
          <span className="text-[10px] font-bold tracking-wide text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">POST</span>
          <span className="text-[11px] font-mono text-neutral-400">/v1/events</span>
          <div className="ml-auto flex gap-1">
            <div className="h-2 w-2 rounded-full bg-[#ff5f56]"></div>
            <div className="h-2 w-2 rounded-full bg-[#ffbd2e]"></div>
            <div className="h-2 w-2 rounded-full bg-[#27c93f]"></div>
          </div>
        </div>
        <div className="p-4 font-mono text-[12px] leading-[1.7] overflow-x-auto">
          <div><span className="text-[#d4d4d4]">{'{'}</span></div>
          <div className="pl-4"><span className="text-[#9cdcfe]">"customer_id"</span><span className="text-[#d4d4d4]">: </span><span className="text-[#ce9178]">"cus_8a3f2b"</span><span className="text-[#d4d4d4]">,</span></div>
          <div className="pl-4"><span className="text-[#9cdcfe]">"meter"</span><span className="text-[#d4d4d4]">: </span><span className="text-[#ce9178]">"api_requests"</span><span className="text-[#d4d4d4]">,</span></div>
          <div className="pl-4"><span className="text-[#9cdcfe]">"value"</span><span className="text-[#d4d4d4]">: </span><span className="text-[#b5cea8]">1</span><span className="text-[#d4d4d4]">,</span></div>
          <div className="pl-4"><span className="text-[#9cdcfe]">"idempotency_key"</span><span className="text-[#d4d4d4]">: </span><span className="text-[#ce9178]">"evt_a1b2c3d4"</span><span className="text-[#d4d4d4]">,</span></div>
          <div className="pl-4"><span className="text-[#9cdcfe]">"properties"</span><span className="text-[#d4d4d4]">: {'{'}</span></div>
          <div className="pl-8"><span className="text-[#9cdcfe]">"endpoint"</span><span className="text-[#d4d4d4]">: </span><span className="text-[#ce9178]">"/v1/completions"</span><span className="text-[#d4d4d4]">,</span></div>
          <div className="pl-8"><span className="text-[#9cdcfe]">"model"</span><span className="text-[#d4d4d4]">: </span><span className="text-[#ce9178]">"gpt-4"</span></div>
          <div className="pl-4"><span className="text-[#d4d4d4]">{'}'}</span></div>
          <div><span className="text-[#d4d4d4]">{'}'}</span></div>
        </div>
        <div className="border-t border-neutral-700/50 px-4 py-2 flex items-center gap-2">
          <span className="text-[10px] font-mono text-neutral-500">Authorization: Bearer llah_sk_...</span>
        </div>
      </div>

      {/* Response */}
      <div className="rounded-xl border border-neutral-800 bg-[#1e1e1e] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-neutral-700/50 px-4 py-2.5">
          <span className="text-[10px] font-bold tracking-wide text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">201</span>
          <span className="text-[11px] font-mono text-neutral-400">Created</span>
          <span className="text-[10px] text-neutral-600 ml-auto">14ms</span>
        </div>
        <div className="p-4 font-mono text-[12px] leading-[1.7] overflow-x-auto">
          <div><span className="text-[#d4d4d4]">{'{'}</span></div>
          <div className="pl-4"><span className="text-[#9cdcfe]">"success"</span><span className="text-[#d4d4d4]">: </span><span className="text-[#569cd6]">true</span><span className="text-[#d4d4d4]">,</span></div>
          <div className="pl-4"><span className="text-[#9cdcfe]">"data"</span><span className="text-[#d4d4d4]">: {'{'}</span></div>
          <div className="pl-8"><span className="text-[#9cdcfe]">"id"</span><span className="text-[#d4d4d4]">: </span><span className="text-[#ce9178]">"evt_9f7e8d6c5b"</span><span className="text-[#d4d4d4]">,</span></div>
          <div className="pl-8"><span className="text-[#9cdcfe]">"customer_id"</span><span className="text-[#d4d4d4]">: </span><span className="text-[#ce9178]">"cus_8a3f2b"</span><span className="text-[#d4d4d4]">,</span></div>
          <div className="pl-8"><span className="text-[#9cdcfe]">"meter"</span><span className="text-[#d4d4d4]">: </span><span className="text-[#ce9178]">"api_requests"</span><span className="text-[#d4d4d4]">,</span></div>
          <div className="pl-8"><span className="text-[#9cdcfe]">"value"</span><span className="text-[#d4d4d4]">: </span><span className="text-[#b5cea8]">1</span><span className="text-[#d4d4d4]">,</span></div>
          <div className="pl-8"><span className="text-[#9cdcfe]">"status"</span><span className="text-[#d4d4d4]">: </span><span className="text-[#ce9178]">"processed"</span><span className="text-[#d4d4d4]">,</span></div>
          <div className="pl-8"><span className="text-[#9cdcfe]">"created_at"</span><span className="text-[#d4d4d4]">: </span><span className="text-[#ce9178]">"2024-10-20T12:04:32Z"</span></div>
          <div className="pl-4"><span className="text-[#d4d4d4]">{'}'}</span></div>
          <div><span className="text-[#d4d4d4]">{'}'}</span></div>
        </div>
        <div className="border-t border-neutral-700/50 px-4 py-2 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
          <span className="text-[10px] text-neutral-500">Event deduplicated and stored</span>
        </div>
      </div>
    </div>
  );
}
