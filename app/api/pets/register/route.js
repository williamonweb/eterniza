import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { hashPassword } from "../../../../lib/password";

const onlyDigits = (value, max = 30) => String(value || "").replace(/\D/g, "").slice(0, max);

function validCnpj(value) {
  const cnpj = onlyDigits(value, 14);
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  const calc = (base) => {
    let size = base.length - 7;
    let sum = 0;
    for (let i = base.length; i >= 1; i--) {
      sum += Number(base[base.length - i]) * size--;
      if (size < 2) size = 9;
    }
    const result = sum % 11;
    return result < 2 ? 0 : 11 - result;
  };
  return calc(cnpj.slice(0, 12)) === Number(cnpj[12]) &&
    calc(cnpj.slice(0, 13)) === Number(cnpj[13]);
}

function createClinicCode() {
  return `PET-${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const legalName = String(body.legalName || "").trim();
    const tradeName = String(body.tradeName || "").trim();
    const cnpj = onlyDigits(body.cnpj, 14);
    const email = String(body.email || "").trim().toLowerCase();
    const phone = onlyDigits(body.phone, 11);
    const responsibleName = String(body.responsibleName || "").trim();
    const responsibleEmail = String(body.responsibleEmail || "").trim().toLowerCase();
    const responsiblePhone = onlyDigits(body.responsiblePhone, 11);
    const password = String(body.password || "");

    if (!legalName || !tradeName || !validCnpj(cnpj)) {
      return NextResponse.json({ ok: false, message: "Confira razão social, nome fantasia e CNPJ." }, { status: 400 });
    }
    if (!email.includes("@") || !responsibleEmail.includes("@") || password.length < 6) {
      return NextResponse.json({ ok: false, message: "Confira os e-mails e use uma senha com pelo menos 6 caracteres." }, { status: 400 });
    }
    if (![10, 11].includes(phone.length) || ![10, 11].includes(responsiblePhone.length)) {
      return NextResponse.json({ ok: false, message: "Informe telefones válidos com DDD." }, { status: 400 });
    }
    if (!body.accepted) {
      return NextResponse.json({ ok: false, message: "É necessário confirmar os dados antes do envio." }, { status: 400 });
    }

    const [existingClinic, existingUser] = await Promise.all([
      prisma.clinic.findUnique({ where: { cnpj }, select: { id: true, status: true } }),
      prisma.user.findUnique({ where: { email: responsibleEmail }, select: { id: true } }),
    ]);

    if (existingClinic) {
      return NextResponse.json({ ok: false, message: "Este CNPJ já possui uma solicitação ou clínica cadastrada." }, { status: 409 });
    }
    if (existingUser) {
      return NextResponse.json({ ok: false, message: "O e-mail do responsável já possui cadastro no Eterniza." }, { status: 409 });
    }

    const code = createClinicCode();

    const clinic = await prisma.$transaction(async (tx) => {
      const created = await tx.clinic.create({
        data: {
          code, legalName, tradeName, cnpj,
          stateRegistration: String(body.stateRegistration || "").trim() || null,
          email, phone,
          whatsapp: onlyDigits(body.whatsapp, 11) || null,
          website: String(body.website || "").trim() || null,
          instagram: String(body.instagram || "").trim() || null,
          zipCode: onlyDigits(body.zipCode, 8) || null,
          street: String(body.street || "").trim() || null,
          number: String(body.number || "").trim() || null,
          complement: String(body.complement || "").trim() || null,
          district: String(body.district || "").trim() || null,
          city: String(body.city || "").trim() || null,
          state: String(body.state || "").trim().toUpperCase().slice(0, 2) || null,
          responsibleName,
          responsibleRole: String(body.responsibleRole || "").trim() || null,
          responsiblePhone,
          responsibleEmail,
          unitsCount: Math.max(1, Number(body.unitsCount || 1)),
          estimatedMonthlyUses: body.estimatedMonthlyUses ? Math.max(0, Number(body.estimatedMonthlyUses)) : null,
          referralSource: String(body.referralSource || "").trim() || null,
          status: "PENDING",
        },
      });

      await tx.user.create({
        data: {
          name: responsibleName,
          email: responsibleEmail,
          phone: responsiblePhone,
          password: await hashPassword(password),
          role: "CLINIC_MANAGER",
          clinicId: created.id,
        },
      });

      return created;
    });

    return NextResponse.json({ ok: true, code: clinic.code, status: clinic.status }, { status: 201 });
  } catch (error) {
    console.error("[pets/register]", error);
    return NextResponse.json({ ok: false, message: "Não foi possível enviar o cadastro da clínica." }, { status: 500 });
  }
}
