export function getElements(ids: { [name: string]: string }) {
  const result: { [name: string]: HTMLElement } = {};
  for (const [name, id] of Object.entries(ids)) {
    const el = document.getElementById(id);
    if (!el) throw new Error(`failed to get element ${name}:${id}`);
    result[name] = el;
  }
  return result;
}

export function createElement(
  type: string,
  options?: {
    id?: string;
    text?: string;
    classList?: string[];
    children?: Array<HTMLElement | Text | string>;
    attributes?: {
      [attribute: string]: string;
    };
  }
) {
  const el = document.createElement(type);

  if (options) {
    if (options.text) el.appendChild(document.createTextNode(options.text));
    if (options.classList)
      for (const item of options.classList) el.classList.add(item);
    if (options.attributes)
      for (const [key, value] of Object.entries(options.attributes))
        el.setAttribute(key, value);
    if (options.children) for (const item of options.children) el.append(item);
    if (options.id) el.id = options.id;
  }

  return el;
}

export function roundTo(x: number, places: number) {
  const r = 10^places;
  return Math.round(x*r)/r;
}