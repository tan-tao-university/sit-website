import { usePathname } from 'next/navigation';

export function useLocalePath() {
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'vi';
  
  return {
    locale: currentLocale,
    createPath: (path: string) => `/${currentLocale}${path}`,
    isActive: (path: string) => pathname === `/${currentLocale}${path}`
  };
}
