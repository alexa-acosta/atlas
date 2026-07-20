import { createContext, useContext, useEffect, useState } from "react";

const ThemeProviderContext = createContext({
  theme: "dark",
  setTheme: () => {},
});

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "atlas-theme",
}) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(storageKey) || defaultTheme,
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return (
    <ThemeProviderContext.Provider
      value={{
        theme,
        setTheme: (newTheme) => {
          localStorage.setItem(storageKey, newTheme);
          setTheme(newTheme);
        },
      }}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
