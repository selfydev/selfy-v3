import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding automation rules...');

  const rules = [
    {
      name: 'Booking Created - Send Confirmation',
      description: 'Send immediate confirmation email and schedule reminders when a booking is created',
      trigger: 'booking.created',
      conditions: {},
      actions: [
        { type: 'email', template: 'booking-confirmation', immediate: true },
        { type: 'schedule', event: 'template-check', delay: '72h' },
        { type: 'schedule', event: 'template-check', delay: '24h_before' },
        { type: 'schedule', event: 'booking-reminder', delays: ['7d', '3d', '24h'] },
      ],
      isActive: true,
    },
    {
      name: 'Template Incomplete - Send Reminder',
      description: 'Send reminder email if template has not been submitted',
      trigger: 'template.incomplete',
      conditions: { templateSubmitted: false, status: 'CONFIRMED' },
      actions: [
        { type: 'email', template: 'template-reminder' },
      ],
      isActive: true,
    },
    {
      name: 'Booking Reminder - Send Notification',
      description: 'Send reminder email at specified intervals before event',
      trigger: 'booking.reminder',
      conditions: { status: 'CONFIRMED' },
      actions: [
        { type: 'email', template: 'booking-reminder' },
      ],
      isActive: true,
    },
    {
      name: 'Template Submitted - Send Confirmation',
      description: 'Send confirmation email and optional SMS when template is submitted',
      trigger: 'template.submitted',
      conditions: {},
      actions: [
        { type: 'email', template: 'template-submitted' },
        { type: 'sms', optional: true },
        { type: 'admin_notification' },
      ],
      isActive: true,
    },
  ];

  for (const rule of rules) {
    const existing = await prisma.automationRule.findFirst({
      where: { trigger: rule.trigger },
    });

    if (existing) {
      console.log(`Rule "${rule.name}" already exists, updating...`);
      await prisma.automationRule.update({
        where: { id: existing.id },
        data: rule,
      });
    } else {
      console.log(`Creating rule "${rule.name}"...`);
      await prisma.automationRule.create({
        data: rule,
      });
    }
  }

  console.log('✅ Automation rules seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding automation rules:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
