-- Idempotencia de webhooks de pago: evita suscripciones duplicadas
-- al reintentar un webhook con el mismo external_id.
-- Requerido por activarSuscripcion() en src/lib/acceso.ts (upsert onConflict: external_id).

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_external_id_unique UNIQUE (external_id);
