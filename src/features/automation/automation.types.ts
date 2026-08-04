export type WorkflowStatus = 'draft' | 'published' | 'paused' | 'archived';

export interface WorkflowTrigger {
  type: string;
  config: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  type: 'action' | 'condition' | 'wait' | 'approval' | 'ai';
  actionType?: string;
  config: Record<string, any>;
  nextStepId?: string;
  failStepId?: string;
}

export interface AutomationWorkflow {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  category: string;
  status: WorkflowStatus;
  trigger_config: WorkflowTrigger;
  steps: WorkflowStep[];
  created_at: string;
  last_executed_at?: string;
  total_executions: number;
}
