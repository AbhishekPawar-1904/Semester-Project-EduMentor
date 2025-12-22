-- Add RLS policy for admins to view all user roles
CREATE POLICY "Admins can view all user roles"
ON user_roles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  )
);