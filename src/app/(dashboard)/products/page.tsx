import { getCurrentUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ProductsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Get user's corporate organization if they have an active seat
  const userOrgSeat = await prisma.orgSeat.findFirst({
    where: {
      userId: user.id,
      isActive: true,
    },
    include: {
      org: {
        include: {
          packages: {
            where: {
              isActive: true,
            },
          },
        },
      },
    },
  });

  // Get all active products
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      price: 'asc',
    },
  });

  // User is corporate if they have an active OrgSeat OR their role is CORPORATE_MEMBER/CORPORATE_ADMIN
  const isCorporateUser = !!userOrgSeat || user.role === 'CORPORATE_MEMBER' || user.role === 'CORPORATE_ADMIN';
  const orgDiscountPercent = userOrgSeat?.org.discountPercent || 0;

  // Calculate price for corporate users
  const calculatePrice = (basePrice: number) => {
    if (!isCorporateUser || !orgDiscountPercent) return basePrice;
    return basePrice * (1 - orgDiscountPercent / 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Products & Services</h1>
        <p className="mt-2 text-sm text-muted-foreground">Browse our available products and services</p>
      </div>

      {isCorporateUser && userOrgSeat && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <h3 className="text-sm font-semibold text-blue-900">Corporate Benefits</h3>
          <p className="mt-1 text-sm text-blue-700">
            You're a member of <span className="font-medium">{userOrgSeat.org.name}</span>.
            {orgDiscountPercent > 0 && <> Enjoy {orgDiscountPercent}% discount on all products!</>}
          </p>
          {userOrgSeat.org.packages.length > 0 && (
            <p className="mt-1 text-sm text-blue-700">
              You have {userOrgSeat.org.packages.length} active package
              {userOrgSeat.org.packages.length !== 1 ? 's' : ''} available.
            </p>
          )}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const originalPrice = product.price;
          const finalPrice = calculatePrice(originalPrice);
          const hasDiscount = isCorporateUser && orgDiscountPercent > 0;

          return (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group relative rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
            >
              <div className="flex flex-col h-full">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground flex-1">
                  {product.description || 'No description available'}
                </p>

                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    {hasDiscount ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-primary">
                          ${finalPrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-foreground0 line-through">
                          ${originalPrice.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold text-foreground">
                        ${originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-foreground0">{product.duration} min</span>
                </div>

                {hasDiscount && (
                  <div className="mt-2 inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-primary">
                    Save {orgDiscountPercent}%
                  </div>
                )}

                <div className="mt-4">
                  <span className="text-sm font-medium text-primary group-hover:text-primary">
                    View details →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">No products available at the moment.</p>
        </div>
      )}
    </div>
  );
}
