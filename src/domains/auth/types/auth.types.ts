export type AppRole = 'admin' | 'moderator' | 'user' | 'super_admin';

export interface UserProfile {
  id: string;
  company_id: string;
  role_id: string | null;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}
