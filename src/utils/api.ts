export async function fetchData(
  url: string,
  method: string = 'GET',
  params?: Record<string, string>,
  body?: any
) {
  try {
    const queryParams = params ? 
      '?' + new URLSearchParams(params).toString() : 
      '';
    
    const options: RequestInit = { method };
    if (method !== 'GET' && body) {
      options.body = JSON.stringify(body);
      options.headers = { 'Content-Type': 'application/json' };
    }

    const response = await fetch(`${url}${queryParams}`, options);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((acc, key) => acc && acc[key], obj);
}

export function extractDataFromResponse(
  response: unknown,
  path?: string,
  labelKey?: string,
  valueKey?: string
): { label: string; value: string }[] {
  if (!response) return [];

  // Navigate to the specified path in the response
  let data = response;
  if (path) {
    const keys = path.split(".");
    for (const key of keys) {
      data = data[key];
      if (!data) return [];
    }
  }

  // Ensure data is an array
  if (!Array.isArray(data)) return [];

  // Map the data to options format
  return data.map((item) => {
    if (typeof item === "string") {
      return { label: item, value: item };
    }

    const label = labelKey ? getNestedValue(item, labelKey) : item.label || item.name || item.title;
    const value = valueKey ? getNestedValue(item, valueKey) : item.value || item.id || item.code;

    return { label: String(label), value: String(value) };
  });
}