module.exports = {
  trailingComma: 'all', // Ensure trailing commas wherever possible
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  bracketSpacing: true, // Add spaces between brackets
  arrowParens: 'always', // Always include parentheses around arrow function arguments
  printWidth: 80, // Limit line length to 80 characters for better readability
  jsxSingleQuote: true, // Use single quotes in JSX
  endOfLine: 'lf', // Use LF for line endings for consistency across different OS
  proseWrap: 'always', // Automatically wrap prose (markdown text)
  embeddedLanguageFormatting: 'auto', // Format embedded code blocks

  // TSX/JSX specific options
  jsxBracketSameLine: true, // Keep the closing bracket of a JSX element on the same line as the last prop
  quoteProps: 'consistent', // Quote object properties consistently
  htmlWhitespaceSensitivity: 'css', // Respect the default value of CSS display property

  // TypeScript-specific formatting
  tsSpecificConfig: {
    alwaysStrict: true, // Enforce strict mode
  },

  // Whitespace handling in templates
  htmlWhitespaceSensitivity: 'strict', // Handle whitespaces strictly in templates
};
