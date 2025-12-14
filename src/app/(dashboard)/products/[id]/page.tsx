import { getCurrentUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { BookProductForm } from '@/components/products/BookProductForm';

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Await params in Next.js 15+
  const { id } = await params;

  // Get product
  const product = await prisma.product.findUnique({
    where: {
      id: id,
      isActive: true,
    },
  });

  if (!product) {
    notFound();
  }

  // Get user's corporate organization if they're a corporate member/admin
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
              expiresAt: {
                gte: new Date(),
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      },
    },
  });

  const isCorporateUser = user.role === 'CORPORATE_MEMBER' || user.role === 'CORPORATE_ADMIN';
  const orgDiscountPercent = userOrgSeat?.org.discountPercent || 0;
  const availablePackages = userOrgSeat?.org.packages || [];

  // Calculate pricing
  const basePrice = product.price;
  const discountedPrice =
    isCorporateUser && orgDiscountPercent > 0
      ? basePrice * (1 - orgDiscountPercent / 100)
      : basePrice;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-neutral-600">
        <Link href="/products" className="hover:text-neutral-900">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-900">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Product Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <h1 className="text-3xl font-bold text-neutral-900">{product.name}</h1>

            <div className="mt-4 flex items-baseline gap-4">
              {isCorporateUser && orgDiscountPercent > 0 ? (
                <>
                  <span className="text-3xl font-bold text-primary-600">
                    ${discountedPrice.toFixed(2)}
                  </span>
                  <span className="text-xl text-neutral-500 line-through">
                    ${basePrice.toFixed(2)}
                  </span>
                  <span className="rounded-full bg-success-light px-3 py-1 text-sm font-medium text-success-dark">
                    Save {orgDiscountPercent}%
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-neutral-900">${basePrice.toFixed(2)}</span>
              )}
            </div>

            <div className="mt-6 flex items-center gap-4 text-sm text-neutral-600">
              <div className="flex items-center gap-1">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{product.duration} minutes</span>
              </div>
            </div>

            {product.description && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-neutral-900">Description</h2>
                <p className="mt-2 text-neutral-700 whitespace-pre-line">{product.description}</p>
              </div>
            )}
          </div>

          {/* Corporate Benefits */}
          {isCorporateUser && userOrgSeat && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-6">
              <h3 className="text-base font-semibold text-blue-900">Corporate Benefits</h3>
              <div className="mt-3 space-y-2">
                <p className="text-sm text-blue-700">
                  As a member of <span className="font-medium">{userOrgSeat.org.name}</span>, you
                  enjoy {orgDiscountPercent}% discount on all services.
                </p>
                {availablePackages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-blue-900">Available Packages:</p>
                    <ul className="mt-2 space-y-2">
                      {availablePackages.map((pkg) => (
                        <li key={pkg.id} className="text-sm text-blue-700">
                          <span className="font-medium">{pkg.name}</span> -
                          {pkg.totalCredits - pkg.usedCredits} of {pkg.totalCredits} credits
                          remaining
                          {pkg.permanentDiscountPercent > 0 && (
                            <span className="ml-2 text-xs bg-blue-200 text-blue-900 px-2 py-0.5 rounded">
                              +{pkg.permanentDiscountPercent}% extra discount
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-neutral-900">Book this service</h2>
            <BookProductForm
              productId={product.id}
              basePrice={basePrice}
              discountedPrice={discountedPrice}
              orgId={userOrgSeat?.org.id}
              packages={availablePackages}
              isCorporateUser={isCorporateUser}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
