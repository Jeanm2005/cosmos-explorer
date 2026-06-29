import { useState, useEffect, useCallback } from 'react';

export function useTheme() {
    const [isDark, setIsDark] = useState<boolean>(
        () => localStorage.getItem('theme') !== 'light'
    );

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const toggle = useCallback(() => setIsDark((d) => !d), []);

    return { isDark, toggle };
}