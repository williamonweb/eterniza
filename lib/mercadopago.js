// Compatibilidade temporária: o projeto migrou de Mercado Pago para Asaas.
// Novas integrações devem importar de lib/asaas.js.
export { PLANS, getPlanBySlug, createAsaasPixPayment as createPixPayment } from "./asaas";
