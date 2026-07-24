import { prisma } from "../../../../../lib/prisma";
import { getCurrentUser } from "../../../../../lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const encoder = new TextEncoder();
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return new Response("Acesso negado", { status: 403 });

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "ALL";
  const selectedId = url.searchParams.get("ticketId") || "";

  const stream = new ReadableStream({
    async start(controller) {
      let previous = "";
      let active = true;
      request.signal.addEventListener("abort", () => { active = false; });

      try {
        for (let cycle = 0; active && cycle < 25; cycle += 1) {
          const [tickets, grouped, selected] = await Promise.all([
            prisma.supportTicket.findMany({
              where: status !== "ALL" ? { status } : undefined,
              orderBy: { lastMessageAt: "desc" },
              include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
              take: 200,
            }),
            prisma.supportTicket.groupBy({ by: ["status"], _count: { _all: true } }),
            selectedId ? prisma.supportTicket.findUnique({
              where: { id: selectedId },
              include: { messages: { orderBy: { createdAt: "asc" } } },
            }) : null,
          ]);
          const payload = {
            tickets,
            counts: Object.fromEntries(grouped.map((item) => [item.status, item._count._all])),
            selected,
          };
          const fingerprint = JSON.stringify({
            list: tickets.map((ticket) => [ticket.id, ticket.updatedAt, ticket.adminUnread, ticket.status]),
            selected: selected ? [selected.id, selected.updatedAt, selected.messages.length] : null,
          });
          if (fingerprint !== previous) {
            previous = fingerprint;
            controller.enqueue(encoder.encode(`event: update\ndata: ${JSON.stringify(payload)}\n\n`));
          } else {
            controller.enqueue(encoder.encode(`event: ping\ndata: {}\n\n`));
          }
          await wait(1000);
        }
      } catch (error) {
        console.error("admin support stream", error);
      } finally {
        try { controller.close(); } catch {}
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
