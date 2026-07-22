// Compatibilidade temporária: a integração oficial agora é Asaas.
export {
  DEFAULT_PLANS as PLANS,
  getPlanBySlug,
  createAsaasPixPayment as createPixPayment,
} from "./asaas";
