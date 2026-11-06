module.exports = {
  content: ['./App.{js,jsx}', './src/**/*.{js,jsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas: '#ffffff',
        subtle: '#f6f9fc',
        ink: '#0a2540',
        muted: '#6b7c93',
        faint: '#8898aa',
        line: '#e3e8ee',
        accent: '#3d4ed7',
        danger: '#c41e3a',
        success: '#0d9488',
      },
    },
  },
  plugins: [],
};
