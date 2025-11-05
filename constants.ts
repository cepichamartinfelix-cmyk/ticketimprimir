
import { Theme } from './types';

export const THEMES: Theme[] = [
  {
    name: "Azul Claro y Blanco",
    isDark: false,
    colors: {
      '--color-primary': '#3b82f6', // blue-500
      '--color-secondary': '#60a5fa', // blue-400
      '--color-accent': '#2563eb', // blue-600
      '--color-background': '#f1f5f9', // slate-100
      '--color-foreground': '#0f172a', // slate-900
      '--color-card': '#ffffff', // white
      '--color-card-foreground': '#0f172a', // slate-900
      '--color-border': '#e2e8f0', // slate-200
      '--color-input': '#e2e8f0', // slate-200
      '--color-ring': '#3b82f6', // blue-500
    }
  },
  {
    name: "Verde Lima y Gris Oscuro",
    isDark: true,
    colors: {
      '--color-primary': '#84cc16', // lime-500
      '--color-secondary': '#a3e635', // lime-400
      '--color-accent': '#65a30d', // lime-600
      '--color-background': '#1f2937', // gray-800
      '--color-foreground': '#f9fafb', // gray-50
      '--color-card': '#374151', // gray-700
      '--color-card-foreground': '#f9fafb', // gray-50
      '--color-border': '#4b5563', // gray-600
      '--color-input': '#4b5563', // gray-600
      '--color-ring': '#84cc16', // lime-500
    }
  },
  {
    name: "Blanco y Negro",
    isDark: false,
    colors: {
      '--color-primary': '#1f2937', // gray-800
      '--color-secondary': '#4b5563', // gray-600
      '--color-accent': '#000000', // black
      '--color-background': '#ffffff', // white
      '--color-foreground': '#000000', // black
      '--color-card': '#f9fafb', // gray-50
      '--color-card-foreground': '#000000', // black
      '--color-border': '#e5e7eb', // gray-200
      '--color-input': '#e5e7eb', // gray-200
      '--color-ring': '#1f2937', // gray-800
    }
  },
    {
    name: "Blanco y Negro (Oscuro)",
    isDark: true,
    colors: {
      '--color-primary': '#f9fafb', // gray-50
      '--color-secondary': '#d1d5db', // gray-300
      '--color-accent': '#ffffff', // white
      '--color-background': '#000000', // black
      '--color-foreground': '#ffffff', // white
      '--color-card': '#111827', // gray-900
      '--color-card-foreground': '#ffffff', // white
      '--color-border': '#374151', // gray-700
      '--color-input': '#374151', // gray-700
      '--color-ring': '#f9fafb', // gray-50
    }
  },
  {
    name: "Amarillo Claro y Gris",
    isDark: false,
    colors: {
      '--color-primary': '#facc15', // yellow-400
      '--color-secondary': '#fde047', // yellow-300
      '--color-accent': '#eab308', // yellow-500
      '--color-background': '#f3f4f6', // gray-100
      '--color-foreground': '#111827', // gray-900
      '--color-card': '#ffffff', // white
      '--color-card-foreground': '#111827', // gray-900
      '--color-border': '#d1d5db', // gray-300
      '--color-input': '#d1d5db', // gray-300
      '--color-ring': '#facc15', // yellow-400
    }
  }
];
