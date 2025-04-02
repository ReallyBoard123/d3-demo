import React from 'react';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/hooks/useTranslation';

interface LoadingSpinnerProps {
  progress: number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ progress }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <h2 className="text-lg font-semibold">{t('dashboard.loadingDashboard')}</h2>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground">
            {t('dashboard.preparingAnalytics')}
          </p>
        </div>
      </div>
    </div>
  );
}; 