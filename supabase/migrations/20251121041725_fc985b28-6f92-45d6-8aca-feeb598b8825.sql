-- Add RLS policy for admins to view all mentor profiles
CREATE POLICY "Admins can view all mentor profiles"
ON mentor_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);