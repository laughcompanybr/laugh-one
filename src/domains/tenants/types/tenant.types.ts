export interface Company {
  id: string;
  name: string;
  display_name: string | null;
  slug: string;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  success_color: string | null;
  warning_color: string | null;
  error_color: string | null;
  sidebar_color: string | null;
  navbar_color: string | null;
  button_color: string | null;
  card_color: string | null;
  primary_font: string | null;
  secondary_font: string | null;
  theme_mode: string | null;
  border_radius: string | null;
  business_type: string | null;
  onboarding_status: string | null;
  login_welcome_message: string | null;
  login_title: string | null;
  login_subtitle: string | null;
  login_footer: string | null;
  
  // New operational and contact fields
  phone: string | null;
  whatsapp: string | null;
  commercial_email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  website: string | null;
  social_media: any;
  employee_count: number | null;
  services_offered: string[] | null;
  categories: string[] | null;
  business_description: string | null;
  operating_segment: string | null;
  system_preferences: any;
  functional_customizations: any;
  
  created_at: string | null;
  updated_at: string | null;
}
