export type FieldType = 'text' | 'number' | 'select' | 'checkbox' | 'date';

export interface ApiConfig {
  url: string;
  method?: 'GET' | 'POST';
  paramMapping?: Record<string, string>; // Maps source field IDs to API parameter names
  responseMapping?: string; // Path to the array in response, e.g., "data.items"
  labelKey?: string; // Key for option label in response items
  valueKey?: string; // Key for option value in response items
}

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  defaultValue: any;
  visible: boolean;
  options?: string[];
  apiConfig?: ApiConfig; // For fields that get options from API
}

export type ActionType = 'show' | 'hide' | 'enable' | 'disable' | 'setValue' | 'populateOptions';

export interface FormRule {
  sourceFieldId: string;
  event: 'change' | 'focus' | 'blur';
  condition?: {
    operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan';
    value: any;
  };
  action: ActionType;
  targetFieldId: string;
  impact?: any; // Value to set when action is 'setValue'
  apiConfig?: ApiConfig; // For populateOptions action
}

export interface FormConfig {
  fields: FormField[];
  rules: FormRule[];
}