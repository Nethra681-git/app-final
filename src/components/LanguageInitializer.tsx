import { ReactNode } from 'react';
import LanguageSelectionScreen from './LanguageSelectionScreen';
import { useLanguageInitialization } from '../hooks/useLanguageInitialization';

interface LanguageInitializerProps {
  children: ReactNode;
  requiresLanguageSelection?: boolean;
}

/**
 * Wrapper component that shows language selection on first login
 * Usage:
 * <LanguageInitializer requiresLanguageSelection={!isLoggedIn}>
 *   <App />
 * </LanguageInitializer>
 */
export default function LanguageInitializer({
  children,
  requiresLanguageSelection = true,
}: LanguageInitializerProps) {
  const { isLanguageSelected, isLoading, completeLanguageSelection } =
    useLanguageInitialization();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-2xl font-semibold">
          Loading...
        </div>
      </div>
    );
  }

  if (requiresLanguageSelection && !isLanguageSelected) {
    return (
      <LanguageSelectionScreen onLanguageSelect={completeLanguageSelection} />
    );
  }

  return <>{children}</>;
}
