import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const digits = (value) => String(value || "").replace(/\D/g, "").slice(0, 8);

async function fromBrasilApi(cep) {
  const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) throw new Error("BrasilAPI indisponível");

  const data = await response.json();

  return {
    zipCode: data.cep || cep,
    street: data.street || "",
    complement: "",
    district: data.neighborhood || "",
    city: data.city || "",
    state: data.state || "",
  };
}

async function fromViaCep(cep) {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) throw new Error("ViaCEP indisponível");

  const data = await response.json();
  if (data?.erro) throw new Error("CEP não encontrado");

  return {
    zipCode: data.cep || cep,
    street: data.logradouro || "",
    complement: data.complemento || "",
    district: data.bairro || "",
    city: data.localidade || "",
    state: data.uf || "",
  };
}

export async function GET(_request, { params }) {
  const cep = digits(params?.cep);

  if (cep.length !== 8) {
    return NextResponse.json(
      { ok: false, message: "Informe um CEP válido com 8 números." },
      { status: 400 }
    );
  }

  try {
    let address;

    try {
      address = await fromBrasilApi(cep);
    } catch {
      address = await fromViaCep(cep);
    }

    return NextResponse.json(
      { ok: true, address },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch {
    return NextResponse.json(
      { ok: false, message: "CEP não encontrado ou serviço indisponível." },
      { status: 404 }
    );
  }
}
