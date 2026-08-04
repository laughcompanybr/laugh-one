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
    PostgrestVersion: "14.15"
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
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
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
          id?: number
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          record_id: string
          table_name: string
        }
        Update: {
          actor?: string | null
          changed_at?: string
          id?: number
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          record_id?: string
          table_name?: string
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
          block_reason: string | null
          border_radius: string | null
          button_color: string | null
          card_color: string | null
          created_at: string | null
          currency: string | null
          display_name: string | null
          error_color: string | null
          favicon_url: string | null
          font_family: string | null
          id: string
          is_blocked: boolean | null
          language: string | null
          login_background_url: string | null
          login_footer: string | null
          login_image_url: string | null
          login_subtitle: string | null
          login_title: string | null
          login_welcome_message: string | null
          logo_reduced_url: string | null
          logo_url: string | null
          mobile_icon_url: string | null
          name: string
          navbar_color: string | null
          plan_id: string | null
          plan_tier: string | null
          primary_color: string | null
          primary_font: string | null
          secondary_color: string | null
          secondary_font: string | null
          sidebar_color: string | null
          sidebar_image_url: string | null
          slug: string
          status: string | null
          storage_used_bytes: number | null
          success_color: string | null
          theme_mode: string | null
          timezone: string | null
          updated_at: string | null
          warning_color: string | null
        }
        Insert: {
          accent_color?: string | null
          block_reason?: string | null
          border_radius?: string | null
          button_color?: string | null
          card_color?: string | null
          created_at?: string | null
          currency?: string | null
          display_name?: string | null
          error_color?: string | null
          favicon_url?: string | null
          font_family?: string | null
          id?: string
          is_blocked?: boolean | null
          language?: string | null
          login_background_url?: string | null
          login_footer?: string | null
          login_image_url?: string | null
          login_subtitle?: string | null
          login_title?: string | null
          login_welcome_message?: string | null
          logo_reduced_url?: string | null
          logo_url?: string | null
          mobile_icon_url?: string | null
          name: string
          navbar_color?: string | null
          plan_id?: string | null
          plan_tier?: string | null
          primary_color?: string | null
          primary_font?: string | null
          secondary_color?: string | null
          secondary_font?: string | null
          sidebar_color?: string | null
          sidebar_image_url?: string | null
          slug: string
          status?: string | null
          storage_used_bytes?: number | null
          success_color?: string | null
          theme_mode?: string | null
          timezone?: string | null
          updated_at?: string | null
          warning_color?: string | null
        }
        Update: {
          accent_color?: string | null
          block_reason?: string | null
          border_radius?: string | null
          button_color?: string | null
          card_color?: string | null
          created_at?: string | null
          currency?: string | null
          display_name?: string | null
          error_color?: string | null
          favicon_url?: string | null
          font_family?: string | null
          id?: string
          is_blocked?: boolean | null
          language?: string | null
          login_background_url?: string | null
          login_footer?: string | null
          login_image_url?: string | null
          login_subtitle?: string | null
          login_title?: string | null
          login_welcome_message?: string | null
          logo_reduced_url?: string | null
          logo_url?: string | null
          mobile_icon_url?: string | null
          name?: string
          navbar_color?: string | null
          plan_id?: string | null
          plan_tier?: string | null
          primary_color?: string | null
          primary_font?: string | null
          secondary_color?: string | null
          secondary_font?: string | null
          sidebar_color?: string | null
          sidebar_image_url?: string | null
          slug?: string
          status?: string | null
          storage_used_bytes?: number | null
          success_color?: string | null
          theme_mode?: string | null
          timezone?: string | null
          updated_at?: string | null
          warning_color?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
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
          updated_at: string | null
        }
        Insert: {
          activated_at?: string | null
          company_id: string
          custom_order?: number | null
          id?: string
          is_enabled?: boolean | null
          module_id: string
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          activated_at?: string | null
          company_id?: string
          custom_order?: number | null
          id?: string
          is_enabled?: boolean | null
          module_id?: string
          settings?: Json | null
          updated_at?: string | null
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
      company_roles: {
        Row: {
          color: string | null
          company_id: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          company_id: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          company_id?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          order?: number | null
          updated_at?: string | null
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
      coupons: {
        Row: {
          active: boolean | null
          code: string
          company_id: string | null
          created_at: string | null
          discount_fixed: number | null
          discount_percent: number | null
          id: string
          max_uses: number | null
          plan_id: string | null
          uses_count: number | null
          valid_until: string | null
        }
        Insert: {
          active?: boolean | null
          code: string
          company_id?: string | null
          created_at?: string | null
          discount_fixed?: number | null
          discount_percent?: number | null
          id?: string
          max_uses?: number | null
          plan_id?: string | null
          uses_count?: number | null
          valid_until?: string | null
        }
        Update: {
          active?: boolean | null
          code?: string
          company_id?: string | null
          created_at?: string | null
          discount_fixed?: number | null
          discount_percent?: number | null
          id?: string
          max_uses?: number | null
          plan_id?: string | null
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
          {
            foreignKeyName: "coupons_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
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
          status: string
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
          status?: string
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
          status?: string
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
          incurred_at: string
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
          incurred_at?: string
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
          incurred_at?: string
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
          amount: number
          category: string | null
          company_id: string | null
          created_at: string
          created_by: string | null
          description: string
          direction: Database["public"]["Enums"]["payment_direction"]
          due_date: string | null
          id: string
          method: string | null
          notes: string | null
          paid_at: string | null
          receipt_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          category?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          direction: Database["public"]["Enums"]["payment_direction"]
          due_date?: string | null
          id?: string
          method?: string | null
          notes?: string | null
          paid_at?: string | null
          receipt_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          direction?: Database["public"]["Enums"]["payment_direction"]
          due_date?: string | null
          id?: string
          method?: string | null
          notes?: string | null
          paid_at?: string | null
          receipt_url?: string | null
          status?: string
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
          orders_target: number
          profit_target: number
          sales_target: number
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          month: string
          notes?: string | null
          orders_target?: number
          profit_target?: number
          sales_target?: number
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          month?: string
          notes?: string | null
          orders_target?: number
          profit_target?: number
          sales_target?: number
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
      modules: {
        Row: {
          category: string
          created_at: string | null
          default_order: number | null
          dependencies: string[] | null
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
          created_at?: string | null
          default_order?: number | null
          dependencies?: string[] | null
          description?: string | null
          icon?: string | null
          id: string
          is_core?: boolean | null
          main_route: string
          name: string
          status?: string | null
          version?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          default_order?: number | null
          dependencies?: string[] | null
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
          quantity: number
          sku_snapshot: string | null
          unit_cost_price: number
          unit_sale_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name_snapshot: string
          order_id: string
          product_id?: string | null
          quantity?: number
          sku_snapshot?: string | null
          unit_cost_price?: number
          unit_sale_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name_snapshot?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          sku_snapshot?: string | null
          unit_cost_price?: number
          unit_sale_price?: number
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
          amount_received: number
          brand: string | null
          card_fee: number | null
          client_id: string | null
          commission: number | null
          company_id: string | null
          cost_price: number
          created_at: string
          created_by: string | null
          deleted_at: string | null
          employee_id: string | null
          expected_delivery: string | null
          id: string
          model: string | null
          notes: string | null
          order_number: number
          other_costs: number | null
          payment_method: string | null
          photo_path: string | null
          profit: number | null
          purchase_date: string | null
          quantity: number
          reference: string | null
          sale_price: number
          ship_city: string | null
          ship_complement: string | null
          ship_district: string | null
          ship_number: string | null
          ship_reference: string | null
          ship_state: string | null
          ship_street: string | null
          ship_zip: string | null
          shipping: number | null
          status: Database["public"]["Enums"]["order_status"]
          supplier_id: string | null
          tracking_code: string | null
          updated_at: string
        }
        Insert: {
          amount_received?: number
          brand?: string | null
          card_fee?: number | null
          client_id?: string | null
          commission?: number | null
          company_id?: string | null
          cost_price?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id?: string | null
          expected_delivery?: string | null
          id?: string
          model?: string | null
          notes?: string | null
          order_number?: number
          other_costs?: number | null
          payment_method?: string | null
          photo_path?: string | null
          profit?: number | null
          purchase_date?: string | null
          quantity?: number
          reference?: string | null
          sale_price?: number
          ship_city?: string | null
          ship_complement?: string | null
          ship_district?: string | null
          ship_number?: string | null
          ship_reference?: string | null
          ship_state?: string | null
          ship_street?: string | null
          ship_zip?: string | null
          shipping?: number | null
          status?: Database["public"]["Enums"]["order_status"]
          supplier_id?: string | null
          tracking_code?: string | null
          updated_at?: string
        }
        Update: {
          amount_received?: number
          brand?: string | null
          card_fee?: number | null
          client_id?: string | null
          commission?: number | null
          company_id?: string | null
          cost_price?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id?: string | null
          expected_delivery?: string | null
          id?: string
          model?: string | null
          notes?: string | null
          order_number?: number
          other_costs?: number | null
          payment_method?: string | null
          photo_path?: string | null
          profit?: number | null
          purchase_date?: string | null
          quantity?: number
          reference?: string | null
          sale_price?: number
          ship_city?: string | null
          ship_complement?: string | null
          ship_district?: string | null
          ship_number?: string | null
          ship_reference?: string | null
          ship_state?: string | null
          ship_street?: string | null
          ship_zip?: string | null
          shipping?: number | null
          status?: Database["public"]["Enums"]["order_status"]
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
          created_at: string
          created_by: string | null
          direction: Database["public"]["Enums"]["payment_direction"]
          employee_id: string | null
          id: string
          installments: number | null
          method: string | null
          notes: string | null
          order_id: string | null
          paid_at: string
          receipt_url: string | null
        }
        Insert: {
          amount: number
          card_fee?: number | null
          card_fee_percent?: number | null
          created_at?: string
          created_by?: string | null
          direction: Database["public"]["Enums"]["payment_direction"]
          employee_id?: string | null
          id?: string
          installments?: number | null
          method?: string | null
          notes?: string | null
          order_id?: string | null
          paid_at?: string
          receipt_url?: string | null
        }
        Update: {
          amount?: number
          card_fee?: number | null
          card_fee_percent?: number | null
          created_at?: string
          created_by?: string | null
          direction?: Database["public"]["Enums"]["payment_direction"]
          employee_id?: string | null
          id?: string
          installments?: number | null
          method?: string | null
          notes?: string | null
          order_id?: string | null
          paid_at?: string
          receipt_url?: string | null
        }
        Relationships: [
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
          created_at: string | null
          description: string | null
          id: string
          module_id: string | null
          name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id: string
          module_id?: string | null
          name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          module_id?: string | null
          name?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          integrations: Json | null
          max_clients: number | null
          max_products: number | null
          max_uploads: number | null
          max_users: number | null
          modules: Json | null
          name: string
          price_monthly: number | null
          price_yearly: number | null
          status: string | null
          storage_gb: number | null
          support_tier: string | null
          trial_days: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          integrations?: Json | null
          max_clients?: number | null
          max_products?: number | null
          max_uploads?: number | null
          max_users?: number | null
          modules?: Json | null
          name: string
          price_monthly?: number | null
          price_yearly?: number | null
          status?: string | null
          storage_gb?: number | null
          support_tier?: string | null
          trial_days?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          integrations?: Json | null
          max_clients?: number | null
          max_products?: number | null
          max_uploads?: number | null
          max_users?: number | null
          modules?: Json | null
          name?: string
          price_monthly?: number | null
          price_yearly?: number | null
          status?: string | null
          storage_gb?: number | null
          support_tier?: string | null
          trial_days?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      platform_logs: {
        Row: {
          action: string
          company_id: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          company_id?: string | null
          created_at?: string | null
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
          cost_price: number
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          image_url: string | null
          min_stock: number
          name: string
          notes: string | null
          sale_price: number
          sku: string | null
          status: string
          stock_qty: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          company_id?: string | null
          cost_price?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          min_stock?: number
          name: string
          notes?: string | null
          sale_price?: number
          sku?: string | null
          status?: string
          stock_qty?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          company_id?: string | null
          cost_price?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          min_stock?: number
          name?: string
          notes?: string | null
          sale_price?: number
          sku?: string | null
          status?: string
          stock_qty?: number
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
          avatar_url: string | null
          company_id: string | null
          created_at: string
          full_name: string | null
          id: string
          impersonated_company_id: string | null
          role_id: string | null
          theme: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          impersonated_company_id?: string | null
          role_id?: string | null
          theme?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          impersonated_company_id?: string | null
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
          created_at: string | null
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
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
          created_at: string | null
          currency: string | null
          gateway: string
          gateway_transaction_id: string | null
          id: string
          notes: string | null
          payment_date: string | null
          plan_id: string | null
          receipt_url: string | null
          status: string
          subscription_id: string | null
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string | null
          currency?: string | null
          gateway: string
          gateway_transaction_id?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          plan_id?: string | null
          receipt_url?: string | null
          status: string
          subscription_id?: string | null
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string | null
          currency?: string | null
          gateway?: string
          gateway_transaction_id?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          plan_id?: string | null
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
            foreignKeyName: "subscription_payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
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
      subscriptions: {
        Row: {
          amount: number
          canceled_at: string | null
          company_id: string
          created_at: string | null
          currency: string
          expiry_date: string | null
          frequency: string
          gateway: string | null
          gateway_subscription_id: string | null
          id: string
          is_trial: boolean | null
          plan_id: string
          renewal_date: string
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          canceled_at?: string | null
          company_id: string
          created_at?: string | null
          currency?: string
          expiry_date?: string | null
          frequency?: string
          gateway?: string | null
          gateway_subscription_id?: string | null
          id?: string
          is_trial?: boolean | null
          plan_id: string
          renewal_date: string
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          canceled_at?: string | null
          company_id?: string
          created_at?: string | null
          currency?: string
          expiry_date?: string | null
          frequency?: string
          gateway?: string | null
          gateway_subscription_id?: string | null
          id?: string
          is_trial?: boolean | null
          plan_id?: string
          renewal_date?: string
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
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
      get_user_company_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff_or_admin: { Args: { _user_id: string }; Returns: boolean }
      revert_order_stock: { Args: { _order_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "staff" | "super_admin"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
