import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heading } from '@/components/ui/heading';

function PageSkeleton() {
  return (
    <div className="flex flex-1 animate-pulse flex-col gap-4 p-4 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="bg-muted mb-2 h-8 w-48 rounded" />
          <div className="bg-muted h-4 w-96 rounded" />
        </div>
      </div>
      <div className="bg-muted mt-6 h-40 w-full rounded-lg" />
      <div className="bg-muted h-40 w-full rounded-lg" />
    </div>
  );
}

interface PageContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  isLoading?: boolean;
  pageTitle?: string;
  pageDescription?: string;
  pageHeaderAction?: React.ReactNode;
}

export default function PageContainer({
  children,
  scrollable = true,
  isLoading = false,
  pageTitle,
  pageDescription,
  pageHeaderAction,
}: PageContainerProps) {
  const content = isLoading ? <PageSkeleton /> : children;

  const inner = (
    <div className="flex flex-1 flex-col gap-4 p-4 md:px-6">
      {(pageTitle || pageHeaderAction) && (
        <div className="flex items-start justify-between">
          <div>
            {pageTitle && (
              <Heading title={pageTitle} description={pageDescription} />
            )}
          </div>
          {pageHeaderAction && <div>{pageHeaderAction}</div>}
        </div>
      )}
      {content}
    </div>
  );

  return scrollable ? (
    <ScrollArea className="h-[calc(100dvh-52px)]">{inner}</ScrollArea>
  ) : (
    inner
  );
}

