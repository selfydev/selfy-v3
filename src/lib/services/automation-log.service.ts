import { prisma } from '@/lib/prisma';

export class AutomationLogService {
  /**
   * Log automation execution
   */
  async log(params: {
    ruleId: string;
    success: boolean;
    message?: string;
    metadata?: Record<string, any>;
  }) {
    return prisma.automationLog.create({
      data: {
        ruleId: params.ruleId,
        success: params.success,
        message: params.message,
        metadata: params.metadata,
      },
    });
  }

  /**
   * Find automation rule by trigger
   */
  async findActiveRule(trigger: string) {
    return prisma.automationRule.findFirst({
      where: {
        trigger,
        isActive: true,
      },
    });
  }
}

export const automationLogService = new AutomationLogService();
