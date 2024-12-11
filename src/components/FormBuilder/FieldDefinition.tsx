import React, { useState } from 'react';
import { X } from 'lucide-react';
import { FieldType, FormField, ApiConfig } from '../../types/form';

interface Props {
  onAdd: (field: FormField) => void;
}

export default function FieldDefinition({ onAdd }: Props) {
  const [field, setField] = useState<FormField>({
    id: '',
    label: '',
    type: 'text',
    defaultValue: '',
    visible: true,
    options: [],
  });
  const [showApiConfig, setShowApiConfig] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(field);
    setField({
      id: '',
      label: '',
      type: 'text',
      defaultValue: '',
      visible: true,
      options: [],
    });
    setShowApiConfig(false);
    document.getElementById('field-definition')?.classList.add('hidden');
  };

  const handleApiConfigChange = (config: Partial<ApiConfig>) => {
    setField(prev => ({
      ...prev,
      apiConfig: {
        ...prev.apiConfig,
        ...config,
      } as ApiConfig,
    }));
  };

  return (
    <div
      id="field-definition"
      className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Field</h2>
          <button
            onClick={() => document.getElementById('field-definition')?.classList.add('hidden')}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Field ID</label>
            <input
              type="text"
              value={field.id}
              onChange={e => setField(prev => ({ ...prev, id: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Label</label>
            <input
              type="text"
              value={field.label}
              onChange={e => setField(prev => ({ ...prev, label: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={field.type}
              onChange={e => setField(prev => ({ ...prev, type: e.target.value as FieldType }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="select">Select</option>
              <option value="checkbox">Checkbox</option>
              <option value="date">Date</option>
            </select>
          </div>

          {field.type === 'select' && (
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={showApiConfig}
                  onChange={e => setShowApiConfig(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Populate options from API
                </label>
              </div>

              {showApiConfig ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">API URL</label>
                    <input
                      type="url"
                      value={field.apiConfig?.url || ''}
                      onChange={e => handleApiConfigChange({ url: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Response Path</label>
                    <input
                      type="text"
                      placeholder="e.g., data.items"
                      value={field.apiConfig?.responseMapping || ''}
                      onChange={e => handleApiConfigChange({ responseMapping: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Label Key</label>
                    <input
                      type="text"
                      placeholder="e.g., name"
                      value={field.apiConfig?.labelKey || ''}
                      onChange={e => handleApiConfigChange({ labelKey: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Value Key</label>
                    <input
                      type="text"
                      placeholder="e.g., id"
                      value={field.apiConfig?.valueKey || ''}
                      onChange={e => handleApiConfigChange({ valueKey: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Options (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={field.options?.join(',')}
                    onChange={e =>
                      setField(prev => ({
                        ...prev,
                        options: e.target.value.split(',').map(s => s.trim()),
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Default Value</label>
            <input
              type={field.type === 'number' ? 'number' : 'text'}
              value={field.defaultValue}
              onChange={e => setField(prev => ({ ...prev, defaultValue: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={field.visible}
              onChange={e => setField(prev => ({ ...prev, visible: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">Visible by default</label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Add Field
          </button>
        </form>
      </div>
    </div>
  );
}