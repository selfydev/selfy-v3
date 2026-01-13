import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';

// Import all workflow functions
import { bookingCreatedFunction } from '@/lib/inngest/functions/booking-created';
import { templateCheckIncompleteFunction } from '@/lib/inngest/functions/template-check-incomplete';
import { bookingReminderFunction } from '@/lib/inngest/functions/booking-reminder';
import { templateSubmittedFunction } from '@/lib/inngest/functions/template-submitted';

// Serve Inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    bookingCreatedFunction,
    templateCheckIncompleteFunction,
    bookingReminderFunction,
    templateSubmittedFunction,
  ],
});
