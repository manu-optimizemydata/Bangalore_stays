-- Amounts stay immutable. Operators may only flip payout_status when settling the 80% owner share.

CREATE OR REPLACE FUNCTION forbid_ledger_mutation()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'ledger rows are immutable; insert a correction row instead';
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.booking_id IS DISTINCT FROM OLD.booking_id
     OR NEW.total_amount IS DISTINCT FROM OLD.total_amount
     OR NEW.platform_commission IS DISTINCT FROM OLD.platform_commission
     OR NEW.owner_payout IS DISTINCT FROM OLD.owner_payout
     OR NEW.currency IS DISTINCT FROM OLD.currency
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'ledger rows are immutable; insert a correction row instead';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
