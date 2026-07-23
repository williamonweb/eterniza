import { prisma } from "./prisma";

export async function nextSupportCode() {
  const sequence = await prisma.supportSequence.upsert({
    where: { key: "support-ticket" },
    create: { key: "support-ticket", value: 1 },
    update: { value: { increment: 1 } },
    select: { value: true },
  });
  return `AT-${String(sequence.value).padStart(6, "0")}`;
}

export function publicTicket(ticket) {
  return {
    id: ticket.id,
    code: ticket.code,
    name: ticket.name,
    subject: ticket.subject,
    status: ticket.status,
    lastMessageAt: ticket.lastMessageAt,
    closedAt: ticket.closedAt,
    createdAt: ticket.createdAt,
    messages: ticket.messages || [],
  };
}
