-- CreateEnum if it doesn't exist (for shadow database compatibility)
DO $$ BEGIN
    CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterEnum - Add DRAFT value if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'DRAFT' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'BookingStatus')
    ) THEN
        ALTER TYPE "BookingStatus" ADD VALUE 'DRAFT';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable (only if Booking table exists)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Booking') THEN
        ALTER TABLE "Booking" 
        ADD COLUMN IF NOT EXISTS "isCorporate" BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "quoteRequested" BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "netTerms" INTEGER,
        ADD COLUMN IF NOT EXISTS "quoteApprovedAt" TIMESTAMP(3),
        ADD COLUMN IF NOT EXISTS "quoteApprovedById" TEXT;
    END IF;
END $$;

-- CreateIndex (only if table exists)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Booking') THEN
        CREATE INDEX IF NOT EXISTS "Booking_quoteRequested_idx" ON "Booking"("quoteRequested");
    END IF;
END $$;

-- AddForeignKey (only if column exists and constraint doesn't exist)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Booking' AND column_name = 'quoteApprovedById') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Booking_quoteApprovedById_fkey') THEN
            ALTER TABLE "Booking" ADD CONSTRAINT "Booking_quoteApprovedById_fkey" FOREIGN KEY ("quoteApprovedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;
