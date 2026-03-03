-- Add billing fields to partners table for Italian invoicing
ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS billing_company_name text,
  ADD COLUMN IF NOT EXISTS billing_vat_number text,
  ADD COLUMN IF NOT EXISTS billing_address text,
  ADD COLUMN IF NOT EXISTS billing_sdi_code text,
  ADD COLUMN IF NOT EXISTS billing_pec text;