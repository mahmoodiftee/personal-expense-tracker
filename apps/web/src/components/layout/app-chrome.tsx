import { AppNav } from './app-nav';

type AppChromeProps = {
  children: React.ReactNode;
};

/** Global shell: sticky navigation + page content. */
export function AppChrome({ children }: AppChromeProps) {
  return (
    <>
      <AppNav />
      {children}
    </>
  );
}
