'use client';

interface Package {
  id: string;
  name: string;
  totalCredits: number;
  usedCredits: number;
  permanentDiscountPercent: number;
}

interface PackageSelectionStepProps {
  packages: Package[];
  selectedPackageId?: string;
  onSelect: (packageId: string | undefined) => void;
  onNext: () => void;
}

export function PackageSelectionStep({
  packages,
  selectedPackageId,
  onSelect,
  onNext,
}: PackageSelectionStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Choose a Package</h2>
        <p className="mt-2 text-muted-foreground">Select a package or pay full price</p>
      </div>

      <div className="space-y-3">
        {/* Pay Full Price Option */}
        <button
          type="button"
          onClick={() => {
            onSelect(undefined);
            setTimeout(onNext, 300); // Small delay for visual feedback
          }}
          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
            !selectedPackageId
              ? 'border-primary bg-primary-50'
              : 'border-border hover:border-border'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">Pay Full Price</p>
              <p className="text-sm text-muted-foreground mt-1">No package selected</p>
            </div>
            {!selectedPackageId && (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </button>

        {/* Package Cards */}
        {packages.map((pkg) => {
          const remaining = pkg.totalCredits - pkg.usedCredits;
          const isSelected = selectedPackageId === pkg.id;
          const isAvailable = remaining > 0;

          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => {
                if (isAvailable) {
                  onSelect(pkg.id);
                  setTimeout(onNext, 300);
                }
              }}
              disabled={!isAvailable}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-primary bg-primary-50'
                  : isAvailable
                    ? 'border-border hover:border-border hover:shadow-sm'
                    : 'border-neutral-100 bg-background opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{pkg.name}</p>
                    {pkg.permanentDiscountPercent > 0 && (
                      <span className="text-xs bg-muted text-primary px-2 py-0.5 rounded-full">
                        +{pkg.permanentDiscountPercent}% off
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {remaining} of {pkg.totalCredits} credits remaining
                  </p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                {!isAvailable && (
                  <span className="text-xs text-foreground0">Unavailable</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {packages.length === 0 && (
        <div className="text-center py-8 text-foreground0">
          <p>No packages available</p>
        </div>
      )}
    </div>
  );
}
