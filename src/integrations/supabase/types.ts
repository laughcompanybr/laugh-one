export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          created_at: string
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          actor: string | null
          changed_at: string
          id: number
          new_data: Json | null
          old_data: Json | null
          operation: string
          record_id: string
          table_name: string
        }
        Insert: {
          actor?: string | null
          changed_at?: string
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          record_id: string
          table_name: string
        }
        Update: {
          actor?: string | null
          changed_at?: string
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      audit_logs_v2: {
        Row: {
          action: string
          actor_id: string | null
          company_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          new_data: Json | null
          old_data: Json | null
          request_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          company_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          request_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          company_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_v2_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_runs: {
        Row: {
          company_id: string
          error_message: string | null
          finished_at: string | null
          id: string
          payload: Json
          result: Json | null
          started_at: string
          status: string
          trigger_type: string
          workflow_id: string
        }
        Insert: {
          company_id: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          payload?: Json
          result?: Json | null
          started_at?: string
          status: string
          trigger_type: string
          workflow_id: string
        }
        Update: {
          company_id?: string
          error_message?: string | null
          finished_at?: string | null
          id?: string
          payload?: Json
          result?: Json | null
          started_at?: string
          status?: string
          trigger_type?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_runs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_runs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_workflows: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          last_executed_at: string | null
          name: string
          status: string
          steps: Json
          total_executions: number
          trigger_config: Json
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          last_executed_at?: string | null
          name: string
          status?: string
          steps?: Json
          total_executions?: number
          trigger_config?: Json
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          last_executed_at?: string | null
          name?: string
          status?: string
          steps?: Json
          total_executions?: number
          trigger_config?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_workflows_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      business_templates: {
        Row: {
          business_type: string
          created_at: string
          custom_fields: Json | null
          dashboard_widgets: Json | null
          description: string | null
          display_name: string
          enabled_modules: Json | null
          id: string
          terminology: Json | null
          updated_at: string
          workflows: Json | null
        }
        Insert: {
          business_type: string
          created_at?: string
          custom_fields?: Json | null
          dashboard_widgets?: Json | null
          description?: string | null
          display_name: string
          enabled_modules?: Json | null
          id?: string
          terminology?: Json | null
          updated_at?: string
          workflows?: Json | null
        }
        Update: {
          business_type?: string
          created_at?: string
          custom_fields?: Json | null
          dashboard_widgets?: Json | null
          description?: string | null
          display_name?: string
          enabled_modules?: Json | null
          id?: string
          terminology?: Json | null
          updated_at?: string
          workflows?: Json | null
        }
        Relationships: []
      }
      client_attachments: {
        Row: {
          client_id: string
          created_at: string
          filename: string | null
          id: string
          kind: string | null
          mime: string | null
          size: number | null
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          filename?: string | null
          id?: string
          kind?: string | null
          mime?: string | null
          size?: number | null
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          filename?: string | null
          id?: string
          kind?: string | null
          mime?: string | null
          size?: number | null
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_attachments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          city: string | null
          company_id: string | null
          complement: string | null
          cpf: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          district: string | null
          id: string
          instagram: string | null
          name: string
          notes: string | null
          number: string | null
          phone: string | null
          reference: string | null
          state: string | null
          street: string | null
          updated_at: string
          whatsapp: string | null
          zip: string | null
        }
        Insert: {
          city?: string | null
          company_id?: string | null
          complement?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          district?: string | null
          id?: string
          instagram?: string | null
          name: string
          notes?: string | null
          number?: string | null
          phone?: string | null
          reference?: string | null
          state?: string | null
          street?: string | null
          updated_at?: string
          whatsapp?: string | null
          zip?: string | null
        }
        Update: {
          city?: string | null
          company_id?: string | null
          complement?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          district?: string | null
          id?: string
          instagram?: string | null
          name?: string
          notes?: string | null
          number?: string | null
          phone?: string | null
          reference?: string | null
          state?: string | null
          street?: string | null
          updated_at?: string
          whatsapp?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          accent_color: string | null
          address: string | null
          address_complement: string | null
          address_number: string | null
          block_reason: string | null
          border_radius: string | null
          business_description: string | null
          business_type: string | null
          button_color: string | null
          card_color: string | null
          categories: string | null
          city: string | null
          cnae_primary: string | null
          commercial_email: string | null
          country: string | null
          created_at: string
          currency: string | null
          display_name: string | null
          document_number: string | null
          document_type: string | null
          employee_count: number | null
          error_color: string | null
          font_family: string | null
          functional_customizations: Json | null
          id: string
          is_blocked: boolean | null
          language: string | null
          legal_name: string | null
          login_footer: string | null
          login_subtitle: string | null
          login_title: string | null
          login_welcome_message: string | null
          municipal_registration: string | null
          name: string
          navbar_color: string | null
          neighborhood: string | null
          onboarding_status: string | null
          operating_segment: string | null
          phone: string | null
          postal_code: string | null
          primary_color: string | null
          primary_font: string | null
          secondary_color: string | null
          secondary_font: string | null
          services_offered: string | null
          sidebar_color: string | null
          slug: string
          social_media: Json | null
          state: string | null
          state_registration: string | null
          status: string | null
          success_color: string | null
          system_preferences: Json | null
          tax_regime: string | null
          theme_mode: string | null
          timezone: string | null
          trade_name: string | null
          updated_at: string
          warning_color: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          accent_color?: string | null
          address?: string | null
          address_complement?: string | null
          address_number?: string | null
          block_reason?: string | null
          border_radius?: string | null
          business_description?: string | null
          business_type?: string | null
          button_color?: string | null
          card_color?: string | null
          categories?: string | null
          city?: string | null
          cnae_primary?: string | null
          commercial_email?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          display_name?: string | null
          document_number?: string | null
          document_type?: string | null
          employee_count?: number | null
          error_color?: string | null
          font_family?: string | null
          functional_customizations?: Json | null
          id?: string
          is_blocked?: boolean | null
          language?: string | null
          legal_name?: string | null
          login_footer?: string | null
          login_subtitle?: string | null
          login_title?: string | null
          login_welcome_message?: string | null
          municipal_registration?: string | null
          name: string
          navbar_color?: string | null
          neighborhood?: string | null
          onboarding_status?: string | null
          operating_segment?: string | null
          phone?: string | null
          postal_code?: string | null
          primary_color?: string | null
          primary_font?: string | null
          secondary_color?: string | null
          secondary_font?: string | null
          services_offered?: string | null
          sidebar_color?: string | null
          slug: string
          social_media?: Json | null
          state?: string | null
          state_registration?: string | null
          status?: string | null
          success_color?: string | null
          system_preferences?: Json | null
          tax_regime?: string | null
          theme_mode?: string | null
          timezone?: string | null
          trade_name?: string | null
          updated_at?: string
          warning_color?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          accent_color?: string | null
          address?: string | null
          address_complement?: string | null
          address_number?: string | null
          block_reason?: string | null
          border_radius?: string | null
          business_description?: string | null
          business_type?: string | null
          button_color?: string | null
          card_color?: string | null
          categories?: string | null
          city?: string | null
          cnae_primary?: string | null
          commercial_email?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          display_name?: string | null
          document_number?: string | null
          document_type?: string | null
          employee_count?: number | null
          error_color?: string | null
          font_family?: string | null
          functional_customizations?: Json | null
          id?: string
          is_blocked?: boolean | null
          language?: string | null
          legal_name?: string | null
          login_footer?: string | null
          login_subtitle?: string | null
          login_title?: string | null
          login_welcome_message?: string | null
          municipal_registration?: string | null
          name?: string
          navbar_color?: string | null
          neighborhood?: string | null
          onboarding_status?: string | null
          operating_segment?: string | null
          phone?: string | null
          postal_code?: string | null
          primary_color?: string | null
          primary_font?: string | null
          secondary_color?: string | null
          secondary_font?: string | null
          services_offered?: string | null
          sidebar_color?: string | null
          slug?: string
          social_media?: Json | null
          state?: string | null
          state_registration?: string | null
          status?: string | null
          success_color?: string | null
          system_preferences?: Json | null
          tax_regime?: string | null
          theme_mode?: string | null
          timezone?: string | null
          trade_name?: string | null
          updated_at?: string
          warning_color?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      company_activity_logs: {
        Row: {
          action_type: string
          company_id: string
          created_at: string
          description: string | null
          field_changed: string | null
          id: string
          module: string
          new_value: string | null
          old_value: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          company_id: string
          created_at?: string
          description?: string | null
          field_changed?: string | null
          id?: string
          module: string
          new_value?: string | null
          old_value?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          company_id?: string
          created_at?: string
          description?: string | null
          field_changed?: string | null
          id?: string
          module?: string
          new_value?: string | null
          old_value?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_activity_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_modules: {
        Row: {
          activated_at: string | null
          company_id: string
          custom_order: number | null
          id: string
          is_enabled: boolean | null
          module_id: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          company_id: string
          custom_order?: number | null
          id?: string
          is_enabled?: boolean | null
          module_id: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          company_id?: string
          custom_order?: number | null
          id?: string
          is_enabled?: boolean | null
          module_id?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_modules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      company_onboarding_data: {
        Row: {
          business_type: string
          city: string | null
          commercial_email: string | null
          company_id: string | null
          created_at: string
          employee_count: string | null
          id: string
          main_objective: string | null
          onboarding_completed: boolean | null
          phone: string | null
          responsible_name: string | null
          segment_data: Json | null
          state: string | null
          updated_at: string
        }
        Insert: {
          business_type: string
          city?: string | null
          commercial_email?: string | null
          company_id?: string | null
          created_at?: string
          employee_count?: string | null
          id?: string
          main_objective?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          responsible_name?: string | null
          segment_data?: Json | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          business_type?: string
          city?: string | null
          commercial_email?: string | null
          company_id?: string | null
          created_at?: string
          employee_count?: string | null
          id?: string
          main_objective?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          responsible_name?: string | null
          segment_data?: Json | null
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_onboarding_data_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_roles: {
        Row: {
          color: string | null
          company_id: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          order: number | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          company_id: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          order?: number | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          company_id?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      cookie_consents: {
        Row: {
          analytics: boolean
          company_id: string | null
          consent_version: string
          created_at: string
          granted_at: string
          id: string
          marketing: boolean
          necessary: boolean
          preferences: boolean
          revoked_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          analytics?: boolean
          company_id?: string | null
          consent_version: string
          created_at?: string
          granted_at?: string
          id?: string
          marketing?: boolean
          necessary?: boolean
          preferences?: boolean
          revoked_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          analytics?: boolean
          company_id?: string | null
          consent_version?: string
          created_at?: string
          granted_at?: string
          id?: string
          marketing?: boolean
          necessary?: boolean
          preferences?: boolean
          revoked_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cookie_consents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean | null
          code: string
          company_id: string | null
          created_at: string
          discount_fixed: number | null
          discount_percent: number | null
          id: string
          max_uses: number | null
          uses_count: number | null
          valid_until: string | null
        }
        Insert: {
          active?: boolean | null
          code: string
          company_id?: string | null
          created_at?: string
          discount_fixed?: number | null
          discount_percent?: number | null
          id?: string
          max_uses?: number | null
          uses_count?: number | null
          valid_until?: string | null
        }
        Update: {
          active?: boolean | null
          code?: string
          company_id?: string | null
          created_at?: string
          discount_fixed?: number | null
          discount_percent?: number | null
          id?: string
          max_uses?: number | null
          uses_count?: number | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      data_subject_requests: {
        Row: {
          company_id: string | null
          completed_at: string | null
          created_at: string
          description: string
          id: string
          request_type: string
          response_notes: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          completed_at?: string | null
          created_at?: string
          description: string
          id?: string
          request_type: string
          response_notes?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string
          id?: string
          request_type?: string
          response_notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_subject_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          base_salary: number | null
          commission_percent: number | null
          company_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email: string | null
          full_name: string
          hire_date: string | null
          id: string
          notes: string | null
          phone: string | null
          role: string | null
          status: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          base_salary?: number | null
          commission_percent?: number | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          full_name: string
          hire_date?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          base_salary?: number | null
          commission_percent?: number | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          full_name?: string
          hire_date?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          company_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          incurred_at: string | null
          receipt_url: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          incurred_at?: string | null
          receipt_url?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          incurred_at?: string | null
          receipt_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          amount: number | null
          category: string | null
          company_id: string | null
          created_at: string
          created_by: string | null
          description: string
          direction: string
          due_date: string | null
          id: string
          method: string | null
          notes: string | null
          paid_at: string | null
          receipt_url: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          category?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          direction: string
          due_date?: string | null
          id?: string
          method?: string | null
          notes?: string | null
          paid_at?: string | null
          receipt_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          category?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          direction?: string
          due_date?: string | null
          id?: string
          method?: string | null
          notes?: string | null
          paid_at?: string | null
          receipt_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          company_id: string | null
          created_at: string
          created_by: string | null
          id: string
          month: string
          notes: string | null
          orders_target: number | null
          profit_target: number | null
          sales_target: number | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          month: string
          notes?: string | null
          orders_target?: number | null
          profit_target?: number | null
          sales_target?: number | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          month?: string
          notes?: string | null
          orders_target?: number | null
          profit_target?: number | null
          sales_target?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_backup_codes: {
        Row: {
          code_hash: string
          created_at: string
          id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          code_hash: string
          created_at?: string
          id?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          code_hash?: string
          created_at?: string
          id?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      module_permissions: {
        Row: {
          can_edit: boolean | null
          can_view: boolean | null
          company_id: string | null
          id: string
          module_id: string
          role_id: string | null
        }
        Insert: {
          can_edit?: boolean | null
          can_view?: boolean | null
          company_id?: string | null
          id?: string
          module_id: string
          role_id?: string | null
        }
        Update: {
          can_edit?: boolean | null
          can_view?: boolean | null
          company_id?: string | null
          id?: string
          module_id?: string
          role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_permissions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "company_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          category: string
          created_at: string
          default_order: number | null
          dependencies: string | null
          description: string | null
          icon: string | null
          id: string
          is_core: boolean | null
          main_route: string
          name: string
          status: string | null
          version: string | null
        }
        Insert: {
          category: string
          created_at?: string
          default_order?: number | null
          dependencies?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_core?: boolean | null
          main_route: string
          name: string
          status?: string | null
          version?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          default_order?: number | null
          dependencies?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_core?: boolean | null
          main_route?: string
          name?: string
          status?: string | null
          version?: string | null
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          last_error: string | null
          payload: Json
          recipient: string
          retry_count: number | null
          sent_at: string | null
          status: string | null
          type: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          last_error?: string | null
          payload: Json
          recipient: string
          retry_count?: number | null
          sent_at?: string | null
          status?: string | null
          type: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          last_error?: string | null
          payload?: Json
          recipient?: string
          retry_count?: number | null
          sent_at?: string | null
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_queue_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      order_attachments: {
        Row: {
          created_at: string
          filename: string | null
          id: string
          kind: string | null
          mime: string | null
          order_id: string
          size: number | null
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          filename?: string | null
          id?: string
          kind?: string | null
          mime?: string | null
          order_id: string
          size?: number | null
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          filename?: string | null
          id?: string
          kind?: string | null
          mime?: string | null
          order_id?: string
          size?: number | null
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_attachments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_events: {
        Row: {
          actor: string | null
          created_at: string
          id: string
          message: string | null
          meta: Json | null
          order_id: string
          type: string
        }
        Insert: {
          actor?: string | null
          created_at?: string
          id?: string
          message?: string | null
          meta?: Json | null
          order_id: string
          type: string
        }
        Update: {
          actor?: string | null
          created_at?: string
          id?: string
          message?: string | null
          meta?: Json | null
          order_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          name_snapshot: string
          order_id: string
          product_id: string | null
          quantity: number | null
          sku_snapshot: string | null
          unit_cost_price: number | null
          unit_sale_price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name_snapshot: string
          order_id: string
          product_id?: string | null
          quantity?: number | null
          sku_snapshot?: string | null
          unit_cost_price?: number | null
          unit_sale_price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name_snapshot?: string
          order_id?: string
          product_id?: string | null
          quantity?: number | null
          sku_snapshot?: string | null
          unit_cost_price?: number | null
          unit_sale_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_received: number | null
          brand: string | null
          card_fee: number | null
          client_id: string | null
          commission: number | null
          company_id: string | null
          cost_price: number | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          employee_id: string | null
          expected_delivery: string | null
          id: string
          model: string | null
          notes: string | null
          order_number: number | null
          other_costs: number | null
          payment_method: string | null
          photo_path: string | null
          profit: number | null
          purchase_date: string | null
          quantity: number | null
          reference: string | null
          sale_price: number | null
          ship_city: string | null
          ship_complement: string | null
          ship_district: string | null
          ship_number: string | null
          ship_reference: string | null
          ship_state: string | null
          ship_street: string | null
          ship_zip: string | null
          shipping: number | null
          status: Database["public"]["Enums"]["order_status"] | null
          supplier_id: string | null
          tracking_code: string | null
          updated_at: string
        }
        Insert: {
          amount_received?: number | null
          brand?: string | null
          card_fee?: number | null
          client_id?: string | null
          commission?: number | null
          company_id?: string | null
          cost_price?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id?: string | null
          expected_delivery?: string | null
          id?: string
          model?: string | null
          notes?: string | null
          order_number?: number | null
          other_costs?: number | null
          payment_method?: string | null
          photo_path?: string | null
          profit?: number | null
          purchase_date?: string | null
          quantity?: number | null
          reference?: string | null
          sale_price?: number | null
          ship_city?: string | null
          ship_complement?: string | null
          ship_district?: string | null
          ship_number?: string | null
          ship_reference?: string | null
          ship_state?: string | null
          ship_street?: string | null
          ship_zip?: string | null
          shipping?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          supplier_id?: string | null
          tracking_code?: string | null
          updated_at?: string
        }
        Update: {
          amount_received?: number | null
          brand?: string | null
          card_fee?: number | null
          client_id?: string | null
          commission?: number | null
          company_id?: string | null
          cost_price?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id?: string | null
          expected_delivery?: string | null
          id?: string
          model?: string | null
          notes?: string | null
          order_number?: number | null
          other_costs?: number | null
          payment_method?: string | null
          photo_path?: string | null
          profit?: number | null
          purchase_date?: string | null
          quantity?: number | null
          reference?: string | null
          sale_price?: number | null
          ship_city?: string | null
          ship_complement?: string | null
          ship_district?: string | null
          ship_number?: string | null
          ship_reference?: string | null
          ship_state?: string | null
          ship_street?: string | null
          ship_zip?: string | null
          shipping?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          supplier_id?: string | null
          tracking_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          card_fee: number | null
          card_fee_percent: number | null
          company_id: string | null
          created_at: string
          created_by: string | null
          direction: Database["public"]["Enums"]["payment_direction"]
          employee_id: string | null
          id: string
          installments: number | null
          method: string | null
          notes: string | null
          order_id: string | null
          paid_at: string | null
          receipt_url: string | null
        }
        Insert: {
          amount: number
          card_fee?: number | null
          card_fee_percent?: number | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          direction: Database["public"]["Enums"]["payment_direction"]
          employee_id?: string | null
          id?: string
          installments?: number | null
          method?: string | null
          notes?: string | null
          order_id?: string | null
          paid_at?: string | null
          receipt_url?: string | null
        }
        Update: {
          amount?: number
          card_fee?: number | null
          card_fee_percent?: number | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          direction?: Database["public"]["Enums"]["payment_direction"]
          employee_id?: string | null
          id?: string
          installments?: number | null
          method?: string | null
          notes?: string | null
          order_id?: string | null
          paid_at?: string | null
          receipt_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          module_id: string | null
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          module_id?: string | null
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          module_id?: string | null
          name?: string
        }
        Relationships: []
      }
      platform_logs: {
        Row: {
          action: string
          company_id: string | null
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          company_id?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          company_id?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_consents: {
        Row: {
          company_id: string | null
          consent_type: string
          created_at: string
          document_version: string
          granted: boolean
          granted_at: string
          id: string
          revoked_at: string | null
          user_id: string
        }
        Insert: {
          company_id?: string | null
          consent_type: string
          created_at?: string
          document_version: string
          granted: boolean
          granted_at?: string
          id?: string
          revoked_at?: string | null
          user_id: string
        }
        Update: {
          company_id?: string | null
          consent_type?: string
          created_at?: string
          document_version?: string
          granted?: boolean
          granted_at?: string
          id?: string
          revoked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "privacy_consents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      product_movements: {
        Row: {
          actor: string | null
          created_at: string
          id: string
          order_id: string | null
          product_id: string
          qty: number
          qty_after: number
          reason: string | null
          type: string
        }
        Insert: {
          actor?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          product_id: string
          qty: number
          qty_after: number
          reason?: string | null
          type: string
        }
        Update: {
          actor?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          product_id?: string
          qty?: number
          qty_after?: number
          reason?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          company_id: string | null
          cost_price: number | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          image_url: string | null
          min_stock: number | null
          name: string
          notes: string | null
          sale_price: number | null
          sku: string | null
          status: string | null
          stock_qty: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          company_id?: string | null
          cost_price?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          min_stock?: number | null
          name: string
          notes?: string | null
          sale_price?: number | null
          sku?: string | null
          status?: string | null
          stock_qty?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          company_id?: string | null
          cost_price?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          min_stock?: number | null
          name?: string
          notes?: string | null
          sale_price?: number | null
          sku?: string | null
          status?: string | null
          stock_qty?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accepted_privacy_at: string | null
          accepted_privacy_version: string | null
          accepted_terms_at: string | null
          accepted_terms_version: string | null
          avatar_url: string | null
          company_id: string | null
          cpf: string | null
          created_at: string
          full_name: string | null
          id: string
          impersonated_company_id: string | null
          phone: string | null
          role_id: string | null
          theme: string | null
          updated_at: string
        }
        Insert: {
          accepted_privacy_at?: string | null
          accepted_privacy_version?: string | null
          accepted_terms_at?: string | null
          accepted_terms_version?: string | null
          avatar_url?: string | null
          company_id?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          impersonated_company_id?: string | null
          phone?: string | null
          role_id?: string | null
          theme?: string | null
          updated_at?: string
        }
        Update: {
          accepted_privacy_at?: string | null
          accepted_privacy_version?: string | null
          accepted_terms_at?: string | null
          accepted_terms_version?: string | null
          avatar_url?: string | null
          company_id?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          impersonated_company_id?: string | null
          phone?: string | null
          role_id?: string | null
          theme?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_impersonated_company_id_fkey"
            columns: ["impersonated_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "company_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          company_id: string
          created_at: string
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "company_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_payments: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          currency: string | null
          gateway: string
          gateway_transaction_id: string | null
          id: string
          notes: string | null
          payment_date: string | null
          receipt_url: string | null
          status: string
          subscription_id: string | null
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string
          currency?: string | null
          gateway: string
          gateway_transaction_id?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          receipt_url?: string | null
          status: string
          subscription_id?: string | null
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          currency?: string | null
          gateway?: string
          gateway_transaction_id?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          receipt_url?: string | null
          status?: string
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_pricing: {
        Row: {
          created_at: string
          days: number
          label: string
          months: number
          period: Database["public"]["Enums"]["billing_period"]
          price: number
          savings_percent: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          days: number
          label: string
          months: number
          period: Database["public"]["Enums"]["billing_period"]
          price: number
          savings_percent?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          days?: number
          label?: string
          months?: number
          period?: Database["public"]["Enums"]["billing_period"]
          price?: number
          savings_percent?: number
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          billing_period: Database["public"]["Enums"]["billing_period"]
          canceled_at: string | null
          company_id: string
          created_at: string
          currency: string
          expires_at: string
          gateway: string | null
          gateway_subscription_id: string | null
          id: string
          notes: string | null
          plan_name: string
          start_date: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number
          billing_period?: Database["public"]["Enums"]["billing_period"]
          canceled_at?: string | null
          company_id: string
          created_at?: string
          currency?: string
          expires_at: string
          gateway?: string | null
          gateway_subscription_id?: string | null
          id?: string
          notes?: string | null
          plan_name?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          billing_period?: Database["public"]["Enums"]["billing_period"]
          canceled_at?: string | null
          company_id?: string
          created_at?: string
          currency?: string
          expires_at?: string
          gateway?: string | null
          gateway_subscription_id?: string | null
          id?: string
          notes?: string | null
          plan_name?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          avg_delivery_days: number | null
          company: string | null
          company_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email: string | null
          id: string
          instagram: string | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          avg_delivery_days?: number | null
          company?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          avg_delivery_days?: number | null
          company?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      system_errors: {
        Row: {
          company_id: string | null
          context: Json | null
          created_at: string
          error_message: string | null
          error_type: string | null
          id: string
          request_id: string | null
          stack_trace: string | null
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          context?: Json | null
          created_at?: string
          error_message?: string | null
          error_type?: string | null
          id?: string
          request_id?: string | null
          stack_trace?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          context?: Json | null
          created_at?: string
          error_message?: string | null
          error_type?: string | null
          id?: string
          request_id?: string | null
          stack_trace?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_errors_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      system_telemetry: {
        Row: {
          actor_id: string | null
          context: Json | null
          created_at: string
          event_type: string
          id: string
          message: string | null
          request_id: string | null
        }
        Insert: {
          actor_id?: string | null
          context?: Json | null
          created_at?: string
          event_type: string
          id?: string
          message?: string | null
          request_id?: string | null
        }
        Update: {
          actor_id?: string | null
          context?: Json | null
          created_at?: string
          event_type?: string
          id?: string
          message?: string | null
          request_id?: string | null
        }
        Relationships: []
      }
      user_consent: {
        Row: {
          consent_type: string
          created_at: string
          granted: boolean | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          consent_type: string
          created_at?: string
          granted?: boolean | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          consent_type?: string
          created_at?: string
          granted?: boolean | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_product_stock: {
        Args: {
          _product_id: string
          _qty: number
          _reason: string
          _type: string
        }
        Returns: number
      }
      apply_order_stock_out: { Args: { _order_id: string }; Returns: undefined }
      bootstrap_current_user_workspace: { Args: never; Returns: Json }
      check_profiles_recursion: { Args: never; Returns: boolean }
      create_data_subject_request: {
        Args: { p_description: string; p_request_type: string }
        Returns: {
          company_id: string | null
          completed_at: string | null
          created_at: string
          description: string
          id: string
          request_type: string
          response_notes: string | null
          status: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "data_subject_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_user_has_active_subscription: { Args: never; Returns: boolean }
      expire_due_subscriptions: { Args: never; Returns: number }
      get_module_access_indicators: {
        Args: { _user_id: string }
        Returns: {
          has_access: boolean
          module_slug: string
        }[]
      }
      get_user_company_id: { Args: never; Returns: string }
      has_active_subscription: {
        Args: { _company_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff_or_admin: { Args: { _user_id: string }; Returns: boolean }
      log_audit_event: {
        Args: {
          p_action: string
          p_company_id: string
          p_entity_id: string
          p_entity_type: string
          p_new_data: Json
          p_old_data: Json
          p_request_id?: string
        }
        Returns: string
      }
      log_company_activity: {
        Args: {
          p_action_type: string
          p_company_id: string
          p_description: string
          p_field_changed: string
          p_module: string
          p_new_value: string
          p_old_value: string
          p_user_id: string
        }
        Returns: undefined
      }
      log_system_error: {
        Args: {
          p_company_id: string
          p_context?: Json
          p_error_message: string
          p_error_type: string
          p_request_id: string
          p_stack_trace?: string
          p_user_id: string
        }
        Returns: string
      }
      record_cookie_consent: {
        Args: {
          p_analytics: boolean
          p_consent_version: string
          p_marketing: boolean
          p_preferences: boolean
          p_user_agent?: string
        }
        Returns: string
      }
      record_privacy_consent: {
        Args: { p_consent_type: string; p_document_version: string }
        Returns: string
      }
      revert_order_stock: { Args: { _order_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "staff" | "super_admin"
      billing_period: "monthly" | "quarterly" | "semiannual" | "yearly"
      order_status:
        | "new"
        | "awaiting_deposit"
        | "paid"
        | "purchasing"
        | "in_transit"
        | "received"
        | "ready_delivery"
        | "delivered"
        | "cancelled"
        | "partial_payment"
        | "separating"
        | "shipped"
      payment_direction: "in" | "out"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff", "super_admin"],
      billing_period: ["monthly", "quarterly", "semiannual", "yearly"],
      order_status: [
        "new",
        "awaiting_deposit",
        "paid",
        "purchasing",
        "in_transit",
        "received",
        "ready_delivery",
        "delivered",
        "cancelled",
        "partial_payment",
        "separating",
        "shipped",
      ],
      payment_direction: ["in", "out"],
    },
  },
} as const
