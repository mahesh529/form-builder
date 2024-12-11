import React, { useState, useEffect } from 'react';
import { FormConfig } from '../../types/form';
import { fetchData, extractDataFromResponse } from '../../utils/api';
import { saveToStorage, loadFromStorage } from '../../utils/storage';

interface Props {
  config: FormConfig;
}

interface FieldOptions {
  [key: string]: { label: string; value: string; id: string }[];
}

export default function FormPreview({ config }: Props) {
  const [formState, setFormState] = useState<Record<string, any>>({});
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set());
  const [disabledFields, setDisabledFields] = useState<Set<string>>(new Set());
  const [fieldOptions, setFieldOptions] = useState<FieldOptions>({});

  useEffect(() => {
    const savedData = loadFromStorage();
    if (savedData?.formState) {
      setFormState(savedData.formState);
    }

    const initialVisibleFields = new Set<string>();
    config.fields.forEach((field) => {
      if (field.visible) {
        initialVisibleFields.add(field.id);
      }

      if (field.type === 'select' && field.apiConfig?.url) {
        loadFieldOptions(field.id, field.apiConfig);
      }
    });

    setVisibleFields(initialVisibleFields);
  }, [config.fields]);

  useEffect(() => {
    saveToStorage({ config, formState });
  }, [config, formState]);

  const loadFieldOptions = async (
    fieldId: string,
    apiConfig: NonNullable<(typeof config.fields)[0]['apiConfig']>,
    params?: Record<string, string>
  ) => {
    const data = await fetchData(apiConfig.url, apiConfig.method, params);
    const options = extractDataFromResponse(
      data,
      apiConfig.responseMapping,
      apiConfig.labelKey,
      apiConfig.valueKey
    ).map((opt, index) => ({
      ...opt,
      id: `${fieldId}-${opt.value}-${index}`,
    }));
    setFieldOptions((prev) => ({ ...prev, [fieldId]: options }));
  };

  const handleFieldChange = async (fieldId: string, value: any) => {
    const newFormState = { ...formState, [fieldId]: value };
    setFormState(newFormState);
    saveToStorage({ config, formState: newFormState });

    for (const rule of config.rules) {
      if (rule.sourceFieldId === fieldId && rule.event === 'change') {
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
          case 'setValue':
            const newState = {
              ...newFormState,
              [rule.targetFieldId]: rule.impact,
            };
            setFormState(newState);
            saveToStorage({ config, formState: newState });
            break;
        }
      }
    }
  };

  const renderField = (field: (typeof config.fields)[0]) => {
    if (!visibleFields.has(field.id)) return null;

    const commonProps = {
      id: field.id,
      disabled: disabledFields.has(field.id),
      className:
        'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
      value: formState[field.id] ?? field.defaultValue ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        handleFieldChange(field.id, e.target.value),
    };

    switch (field.type) {
      case 'text':
      case 'date':
        return <input type={field.type} {...commonProps} />;
      case 'number':
        return (
          <input
            type="number"
            {...commonProps}
            value={formState[field.id] ?? field.defaultValue ?? 0}
          />
        );
      case 'select':
        console.log('fieldOptions:', fieldOptions, ',field:', field);
        const options =
          fieldOptions[field.id] ||
          field.options?.map((opt, index) => ({
            label: opt,
            value: opt,
            id: `${field.id}-${opt}-${index}`,
          })) ||
          [];

        return (
          <select {...commonProps}>
            <option value="">Select an option</option>
            {options.map(({ label, value, id }) => (
              <option key={id} value={value}>
                {label}
              </option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <input
            type="checkbox"
            id={field.id}
            checked={formState[field.id] ?? field.defaultValue ?? false}
            onChange={(e) => handleFieldChange(field.id, e.target.checked)}
            disabled={disabledFields.has(field.id)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        );
      default:
        return null;
    }
  };

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      {config.fields.map((field) => (
        <div
          key={field.id}
          className={`space-y-1 transition-all duration-200 ${
            visibleFields.has(field.id)
              ? 'opacity-100 max-h-24'
              : 'opacity-0 max-h-0 overflow-hidden'
          }`}
        >
          <label
            htmlFor={field.id}
            className="block text-sm font-medium text-gray-700"
          >
            {field.label}
          </label>
          {renderField(field)}
        </div>
      ))}
    </form>
  );
}
