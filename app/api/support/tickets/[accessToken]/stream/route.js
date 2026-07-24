import { prisma } from "../../../../../../lib/prisma";
import { publicTicket } from "../../../../../../lib/support";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const encoder = new TextEncoder();
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request, { params }) {
  const accessToken = params.accessToken;
  const initial = await prisma.supportTicket.findUnique({ where: { accessToken }, select: { id: true } });
  if (!initial) return new Response("Chamado não encontrado", { status: 404 });

  const stream = new ReadableStream({
    async start(controller) {
      let previous = "";
      let active = true;
      request.signal.addEventListener("abort", () => { active = false; });

      try {
        for (let cycle = 0; active && cycle < 25; cycle += 1) {
          const ticket = await prisma.supportTicket.findUnique({
            where: { accessToken },
            include: { messages: { orderBy: { createdAt: "asc" } } },
          });
          if (!ticket) break;
          const fingerprint = `${ticket.updatedAt.toISOString()}:${ticket.messages.length}:${ticket.clientUnread}`;
          if (fingerprint !== previous) {
            previous = fingerprint;
            if (ticket.clientUnread) {
              await prisma.supportTicket.update({ where: { id: ticket.id }, data: { clientUnread: 0 } });
            }
            controller.enqueue(encoder.encode(`event: update\ndata: ${JSON.stringify({ ticket: publicTicket(ticket) })}\n\n`));
          } else {
            controller.enqueue(encoder.encode(`event: ping\ndata: {}\n\n`));
          }
          await wait(1000);
        }
      } catch (error) {
        console.error("client support stream", error);
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
