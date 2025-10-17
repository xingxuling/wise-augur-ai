-- Fix user_roles table security vulnerability
-- Remove public access to user_roles table to prevent admin account discovery

-- Drop the overly permissive policy that allows anyone to view user roles
DROP POLICY IF EXISTS "Anyone can view user roles" ON public.user_roles;

-- Create a more secure policy that allows users to view only their own role
-- This is needed for UI display while preventing admin account enumeration
CREATE POLICY "Users can view own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Note: The existing security definer functions (has_role, is_admin) will continue
-- to work correctly as they bypass RLS and can query the table internally.