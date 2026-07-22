import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const digits = (value) => String(value || "").replace(/\D/g, "").slice(0, 14);

export async function GET(_request, { params }) {
  const cnpj = digits(params?.cnpj);

  if (cnpj.length !== 14) {
    return NextResponse.json(
      { ok: false, message: "Informe um CNPJ válido com 14 números." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, message: data.message || "CNPJ não encontrado." },
        { status: response.status === 404 ? 404 : 502 }
      );
    }

    const company = {
      legalName: data.razao_social || "",
      tradeName: data.nome_fantasia || data.razao_social || "",
      email: data.email || "",
      phone: data.ddd_telefone_1 || data.ddd_telefone_2 || "",
      zipCode: data.cep || "",
      street: [data.descricao_tipo_de_logradouro, data.logradouro]
        .filter(Boolean)
        .join(" ")
        .trim(),
      number: data.numero || "",
      complement: data.complemento || "",
      district: data.bairro || "",
      city: data.municipio || "",
      state: data.uf || "",
    };

    return NextResponse.json(
      { ok: true, company },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("[pets/lookup/cnpj]", error);

    return NextResponse.json(
      { ok: false, message: "Não foi possível consultar o CNPJ agora." },
      { status: 502 }
    );
  }
}
