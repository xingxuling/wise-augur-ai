-- 1. Remove the overly permissive INSERT policy on referral_rewards
DROP POLICY IF EXISTS "System can create referral rewards" ON referral_rewards;

-- 2. Remove public policy that exposes user_id on referral_codes
DROP POLICY IF EXISTS "Anyone can view active referral codes by code" ON referral_codes;

-- 3. Create secure validation function for referral codes (doesn't expose user_id)
CREATE OR REPLACE FUNCTION public.validate_referral_code(code_to_check text)
RETURNS TABLE (is_valid boolean, referral_code_id uuid, referrer_user_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    true as is_valid,
    id as referral_code_id,
    user_id as referrer_user_id
  FROM referral_codes
  WHERE code = code_to_check
    AND (expires_at IS NULL OR expires_at > now())
    AND (max_uses IS NULL OR uses_count < max_uses)
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.validate_referral_code(text) TO anon, authenticated;

-- 4. Create secure function for incrementing share views (atomic, no race conditions)
CREATE OR REPLACE FUNCTION public.increment_share_views(share_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE reading_shares 
  SET views_count = views_count + 1,
      updated_at = now()
  WHERE id = share_id
    AND (expires_at IS NULL OR expires_at > now());
$$;

GRANT EXECUTE ON FUNCTION public.increment_share_views(uuid) TO anon, authenticated;

-- 5. Add explicit UPDATE policy to prevent any direct client updates on reading_shares
CREATE POLICY "Users can update own shares"
  ON reading_shares FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);