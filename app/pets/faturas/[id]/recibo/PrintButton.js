"use client";

export default function PrintButton() {
  return (
    <button
      className="receipt-print-button"
      onClick={() => window.print()}
      style={{ marginTop:24, padding:"14px 20px", border:0, borderRadius:12, background:"#277ed4", color:"white", fontWeight:800, cursor:"pointer" }}
    >
      Imprimir recibo
    </button>
  );
}
