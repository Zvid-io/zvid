/**
 * Convert fluent-ffmpeg complexFilters (string or array of filter objects) into a filtergraph string
 * Supports common shape: { filter, options, inputs, outputs }
 */
export default function complexFiltersToFiltergraph(
  complexFilters: any
): string {
  // If you already have a full filtergraph string, return it directly.
  if (typeof complexFilters === 'string') return complexFilters;

  // If it's an array, convert it to ffmpeg filtergraph syntax.
  if (Array.isArray(complexFilters)) {
    const parts: string[] = [];

    for (const f of complexFilters) {
      // Allow already-string fragments in the array
      if (typeof f === 'string') {
        parts.push(f);
        continue;
      }

      // fluent-ffmpeg typical object form
      const inputs = f.inputs
        ? Array.isArray(f.inputs)
          ? f.inputs
              .map((i: string) =>
                i.startsWith('[') && i.endsWith(']') ? i : `[${i}]`
              )
              .join('')
          : f.inputs.startsWith('[') && f.inputs.endsWith(']')
            ? f.inputs
            : `[${f.inputs}]`
        : '';

      const outputs = f.outputs
        ? Array.isArray(f.outputs)
          ? f.outputs
              .map((o: string) =>
                o.startsWith('[') && o.endsWith(']') ? o : `[${o}]`
              )
              .join('')
          : f.outputs.startsWith('[') && f.outputs.endsWith(']')
            ? f.outputs
            : `[${f.outputs}]`
        : '';

      const filterName = f.filter ?? f.name; // sometimes "name" is used
      if (!filterName) {
        throw new Error(
          "Invalid complex filter entry: missing 'filter'/'name'"
        );
      }

      // Options can be string ("a=b:c=d") or array or object
      let opts = '';
      if (f.options != null) {
        if (typeof f.options === 'string' || typeof f.options === 'number') {
          opts = f.options;
        } else if (Array.isArray(f.options)) {
          // ["a=b", "c=d"] -> "a=b:c=d"
          opts = f.options.join(':');
        } else if (typeof f.options === 'object') {
          // {a:"b", c:"d"} -> "a=b:c=d"
          opts = Object.entries(f.options)
            .map(([k, v]) => {
              if (k === 'enable') {
                return `${k}='${v}'`;
              }
              return `${k}=${v}`;
            })

            .join(':');
        }
      }

      parts.push(`${inputs}${filterName}${opts ? `=${opts}` : ''}${outputs}`);
    }

    // Each chain separated by semicolon
    return parts.join(';');
  }

  throw new Error(
    'Unsupported complexFilters format (expected string or array).'
  );
}
