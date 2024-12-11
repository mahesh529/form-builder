import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash } from 'lucide-react';
import { FormConfig, FormField, FormRule } from '../../types/form';
import FieldDefinition from './FieldDefinition';
import RuleDefinition from './RuleDefinition';
import FormPreview from './FormPreview';
import { saveToStorage, loadFromStorage, clearStorage } from '../../utils/storage';

export default function FormBuilder() {
  const [formConfig, setFormConfig] = useState<FormConfig>({
    fields: [],
    rules: [],
  });

  useEffect(() => {
    const savedData = loadFromStorage();
    if (savedData) {
      setFormConfig(savedData.config);
    }
  }, []);

  const addField = (field: FormField) => {
    const newConfig = {
      ...formConfig,
      fields: [...formConfig.fields, field],
    };
    setFormConfig(newConfig);
    saveToStorage({ config: newConfig, formState: {} });
  };

  const addRule = (rule: FormRule) => {
    const newConfig = {
      ...formConfig,
      rules: [...formConfig.rules, rule],
    };
    setFormConfig(newConfig);
    saveToStorage({ config: newConfig, formState: {} });
  };

  const handleReset = () => {
    clearStorage();
    setFormConfig({ fields: [], rules: [] });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Form Builder</h1>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          <Trash size={20} />
          Reset Form
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Fields</h2>
              <button
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                onClick={() => document.getElementById('field-definition')?.classList.remove('hidden')}
              >
                <Plus size={20} />
                Add Field
              </button>
            </div>
            <div className="space-y-4">
              {formConfig.fields.map(field => (
                <div key={field.id} className="p-4 border rounded-md">
                  <h3 className="font-medium">{field.label}</h3>
                  <p className="text-sm text-gray-600">Type: {field.type}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Rules</h2>
              <button
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                onClick={() => document.getElementById('rule-definition')?.classList.remove('hidden')}
              >
                <Plus size={20} />
                Add Rule
              </button>
            </div>
            <div className="space-y-4">
              {formConfig.rules.map((rule, index) => (
                <div key={index} className="p-4 border rounded-md">
                  <p className="text-sm">
                    When <span className="font-medium">{rule.sourceFieldId}</span>{' '}
                    {rule.event}, {rule.action}{' '}
                    <span className="font-medium">{rule.targetFieldId}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Form Preview</h2>
          <FormPreview config={formConfig} />
        </div>
      </div>

      <FieldDefinition onAdd={addField} />
      <RuleDefinition fields={formConfig.fields} onAdd={addRule} />
    </div>
  );
}