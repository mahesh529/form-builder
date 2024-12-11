import React, { useState } from 'react';
import { X } from 'lucide-react';
import { FormField, FormRule, ActionType, ApiConfig } from '../../types/form';

interface Props {
  fields: FormField[];
  onAdd: (rule: FormRule) => void;
}

export default function RuleDefinition({ fields, onAdd }: Props) {
  const [rule, setRule] = useState<FormRule>({
    sourceFieldId: '',
    event: 'change',
    action: 'show',
    targetFieldId: '',
  });
  const [showApiConfig, setShowApiConfig] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(rule);
    setRule({
      sourceFieldId: '',
      event: 'change',
      action: 'show',
      targetFieldId: '',
    });
    setShowApiConfig(false);
    document.getElementById('rule-definition')?.classList.add('hidden');
  };

  const handleApiConfigChange = (config: Partial<ApiConfig>) => {
    setRule(prev => ({
      ...prev,
      apiConfig: {
        ...prev.apiConfig,
        ...config,
      } as ApiConfig,
    }));
  };

  return (
    <div
      id="rule-definition"
      className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Rule</h2>
          <button
            onClick={() => document.getElementById('rule-definition')?.classList.add('hidden')}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Source Field</label>
            <select
              value={rule.sourceFieldId}
              onChange={e => setRule(prev => ({ ...prev, sourceFieldId: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select a field</option>
              {fields.map(field => (
                <option key={field.id} value={field.id}>
                  {field.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Event</label>
            <select
              value={rule.event}
              onChange={e => setRule(prev => ({ ...prev, event: e.target.value as 'change' | 'focus' | 'blur' }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="change">On Change</option>
              <option value="focus">On Focus</option>
              <option value="blur">On Blur</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Action</label>
            <select
              value={rule.action}
              onChange={e => {
                const action = e.target.value as ActionType;
                setRule(prev => ({ ...prev, action }));
                setShowApiConfig(action === 'populateOptions');
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="show">Show</option>
              <option value="hide">Hide</option>
              <option value="enable">Enable</option>
              <option value="disable">Disable</option>
              <option value="setValue">Set Value</option>
              <option value="populateOptions">Populate Options</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Target Field</label>
            <select
              value={rule.targetFieldId}
              onChange={e => setRule(prev => ({ ...prev, targetFieldId: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select a field</option>
              {fields.map(field => (
                <option key={field.id} value={field.id}>
                  {field.label}
                </option>
              ))}
            </select>
          </div>

          {rule.action === 'setValue' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Value to Set</label>
              <input
                type="text"
                value={rule.impact || ''}
                onChange={e => setRule(prev => ({ ...prev, impact: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {showApiConfig && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">API URL</label>
                <input
                  type="url"
                  value={rule.apiConfig?.url || ''}
                  onChange={e => handleApiConfigChange({ url: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Parameter Mapping</label>
                <input
                  type="text"
                  placeholder="sourceId:param1,otherId:param2"
                  value={
                    rule.apiConfig?.paramMapping
                      ? Object.entries(rule.apiConfig.paramMapping)
                          .map(([key, value]) => `${key}:${value}`)
                          .join(',')
                      : ''
                  }
                  onChange={e => {
                    const mapping = Object.fromEntries(
                      e.target.value
                        .split(',')
                        .map(pair => pair.split(':'))
                        .filter(pair => pair.length === 2)
                        .map(([key, value]) => [key.trim(), value.trim()])
                    );
                    handleApiConfigChange({ paramMapping: mapping });
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Response Path</label>
                <input
                  type="text"
                  placeholder="e.g., data.items"
                  value={rule.apiConfig?.responseMapping || ''}
                  onChange={e => handleApiConfigChange({ responseMapping: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Label Key</label>
                <input
                  type="text"
                  placeholder="e.g., name"
                  value={rule.apiConfig?.labelKey || ''}
                  onChange={e => handleApiConfigChange({ labelKey: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Value Key</label>
                <input
                  type="text"
                  placeholder="e.g., id"
                  value={rule.apiConfig?.valueKey || ''}
                  onChange={e => handleApiConfigChange({ valueKey: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Add Rule
          </button>
        </form>
      </div>
    </div>
  );
}