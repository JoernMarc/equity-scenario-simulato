export const snakeToCamel = (s: string): string => {
  if (!s) return '';
  return s.toLowerCase().replace(/([-_][a-z])/g, group =>
    group
      .toUpperCase()
      .replace('-', '')
      .replace('_', '')
  );
};