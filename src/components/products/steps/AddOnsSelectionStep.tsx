'use client';

// useState not needed

interface AddOn {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
}

interface AddOnsSelectionStepProps {
  addOns: AddOn[];
  selectedAddOns: Array<{ id: string; quantity: number }>;
  onUpdate: (addOns: Array<{ id: string; quantity: number }>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function AddOnsSelectionStep({
  addOns,
  selectedAddOns,
  onUpdate,
  onNext,
  onBack,
}: AddOnsSelectionStepProps) {
  const updateAddOnQuantity = (addOnId: string, quantity: number) => {
    if (quantity === 0) {
      onUpdate(selectedAddOns.filter((a) => a.id !== addOnId));
    } else {
      const existing = selectedAddOns.find((a) => a.id === addOnId);
      if (existing) {
        onUpdate(selectedAddOns.map((a) => (a.id === addOnId ? { ...a, quantity } : a)));
      } else {
        onUpdate([...selectedAddOns, { id: addOnId, quantity }]);
      }
    }
  };

  const getQuantity = (addOnId: string) => {
    return selectedAddOns.find((a) => a.id === addOnId)?.quantity || 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Add Extras</h2>
        <p className="mt-2 text-muted-foreground">Enhance your booking with add-ons (optional)</p>
      </div>

      {addOns.length === 0 ? (
        <div className="text-center py-8 text-foreground0">
          <p>No add-ons available for this product</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addOns.map((addOn) => {
            const quantity = getQuantity(addOn.id);
            const isSelected = quantity > 0;

            return (
              <div
                key={addOn.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary-50'
                    : 'border-border hover:border-border'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{addOn.name}</h3>
                    {addOn.description && (
                      <p className="text-sm text-muted-foreground mt-1">{addOn.description}</p>
                    )}
                    <p className="text-sm font-medium text-primary mt-2">
                      ${addOn.price.toFixed(2)}
                      {addOn.duration > 0 && ` • +${addOn.duration} min`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateAddOnQuantity(addOn.id, Math.max(0, quantity - 1))}
                    disabled={quantity === 0}
                    className="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateAddOnQuantity(addOn.id, quantity + 1)}
                    className="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-background"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-border">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-foreground hover:text-foreground font-medium"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
