import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash } from 'lucide-react';
import { FormConfig, FormField, FormRule } from '../../types/form';
import FieldDefinition from './FieldDefinition';
import RuleDefinition from './RuleDefinition';
import FormPreview from './FormPreview';
import { saveToStorage, loadFromStorage, clearStorage, loadConfigFromStorage } from '../../utils/storage';

export default function FormBuilder() {
  const [formConfig, setFormConfig] = useState<FormConfig>({
    fields: [],
    rules: [],
  });
  const [fieldToEdit, setFieldToEdit] = useState<FormField | null>(null);
  const [ruleToEdit, setRuleToEdit] = useState<{ rule: FormRule; index: number } | null>(null);

  useEffect(() => {
    const savedConfig = loadConfigFromStorage();
    if (savedConfig) {
      setFormConfig(savedConfig);
    }
  }, []);

  useEffect(() => {
    saveToStorage({ config: formConfig, formState: {}, timestamp: Date.now() });
  }, [formConfig]);

  const addField = (field: FormField) => {
    const fieldIndex = formConfig.fields.findIndex(f => f.id === field.id);
    const newFields = [...formConfig.fields];
    if (fieldIndex !== -1) {
      newFields[fieldIndex] = field;
    } else {
      newFields.push(field);
    }
    const newConfig = {
      ...formConfig,
      fields: newFields,
    };
    setFormConfig(newConfig);
    saveToStorage({ config: newConfig, formState: {}, timestamp: Date.now() });
    setFieldToEdit(null);
  };

  const addRule = (rule: FormRule, index?: number) => {
    const newRules = [...formConfig.rules];
    if (index !== undefined) {
      newRules[index] = rule;
    } else {
      newRules.push(rule);
    }
    const newConfig = {
      ...formConfig,
      rules: newRules,
    };
    setFormConfig(newConfig);
    saveToStorage({ config: newConfig, formState: {}, timestamp: Date.now() });
  };

  const deleteField = (fieldId: string) => {
    const newConfig = {
      ...formConfig,
      fields: formConfig.fields.filter(field => field.id !== fieldId),
      rules: formConfig.rules.filter(rule => rule.sourceFieldId !== fieldId && rule.targetFieldId !== fieldId),
    };
    setFormConfig(newConfig);
    saveToStorage({ config: newConfig, formState: {}, timestamp: Date.now() });
  };

  const handleEditRule = (rule: FormRule, index: number) => {
    document.getElementById('rule-definition')?.classList.remove('hidden');
    setRuleToEdit({ rule, index });
  };

  const deleteRule = (index: number) => {
    const newRules = [...formConfig.rules];
    newRules.splice(index, 1);
    const newConfig = {
      ...formConfig,
      rules: newRules,
    };
    setFormConfig(newConfig);
    saveToStorage({ config: newConfig, formState: {}, timestamp: Date.now() });
  };

  const handleReset = () => {
    clearStorage();
    setFormConfig({ fields: [], rules: [] });
  };

  const handleEditField = (field: FormField) => {
    setFieldToEdit(field);
    document.getElementById('field-definition')?.classList.remove('hidden');
  };

  const handleAddFieldClick = () => {
    setFieldToEdit({
      id: '',
      label: '',
      type: 'text',
      defaultValue: '',
      visible: true,
      options: [],
    });
    document.getElementById('field-definition')?.classList.remove('hidden');
  };

  const handleFieldChange = async (fieldId: string, value: any) => {
    const newFormState = { ...formState, [fieldId]: value };
    setFormState(newFormState);
    saveToStorage({ config, formState: newFormState, timestamp: Date.now() });

    for (const rule of config.rules) {
      if (rule.sourceFieldId === fieldId && rule.event === 'change') {
        if (rule.sourceFieldType && config.fields.find(field => field.id === fieldId)?.type !== rule.sourceFieldType) {
          continue; // Skip if the source field type does not match
        }
        if (rule.action === 'populateOptions' && rule.apiConfig) {
          const params = rule.apiConfig.paramMapping
            ? Object.fromEntries(
                Object.entries(rule.apiConfig.paramMapping).map(
                  ([key, param]) => [param, formState[key] || value]
                )
              )
            : undefined;

          await loadFieldOptions(rule.targetFieldId, rule.apiConfig, params);
          continue;
        }

        switch (rule.action) {
          case 'show':
            setVisibleFields((prev) => new Set([...prev, rule.targetFieldId]));
            break;
          case 'hide':
            setVisibleFields((prev) => {
              const next = new Set(prev);
              next.delete(rule.targetFieldId);
              return next;
            });
            break;
          case 'enable':
            setDisabledFields((prev) => {
              const next = new Set(prev);
              next.delete(rule.targetFieldId);
              return next;
            });
            break;
          case 'disable':
            setDisabledFields((prev) => new Set([...prev, rule.targetFieldId]));
            break;
          case 'setValue': {
            const newState = {
              ...newFormState,
              [rule.targetFieldId]: rule.impact,
            };
            setFormState(newState);
            saveToStorage({ config, formState: newState, timestamp: Date.now() });
            break;
          }
          case 'toggle': {
            const newState = {
              ...newFormState,
              [rule.targetFieldId]: !newFormState[rule.targetFieldId],
            };
            setFormState(newState);
            saveToStorage({ config, formState: newState, timestamp: Date.now() });
            break;
          }
        }
      }
    }
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
                onClick={handleAddFieldClick}
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
                  <button
                    onClick={() => handleEditField(field)}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteField(field.id)}
                    className="text-red-500 hover:underline ml-4"
                  >
                    Delete
                  </button>
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
                  <button
                    onClick={() => handleEditRule(rule, index)}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteRule(index)}
                    className="text-red-500 hover:underline ml-4"
                  >
                    Delete
                  </button>
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

      <FieldDefinition onAdd={addField} fieldToEdit={fieldToEdit} />
      <RuleDefinition fields={formConfig.fields} onAdd={addRule} ruleToEdit={ruleToEdit} />
    </div>
  );
}