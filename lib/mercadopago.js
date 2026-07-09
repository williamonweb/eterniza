// Compatibilidade temporária para arquivos antigos que ainda importam lib/mercadopago.
// A integração oficial agora é Asaas.

export {
  DEFAULT_PLANS as PLANS,
  getPlanBySlug,
  createAsaasPixPayment as createPixPayment,
} from "./asaas";
