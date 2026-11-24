import { auth } from "@/lib/auth";
import { AppError, UnauthorizedError, ForbiddenError } from "@/lib/errors";
import { logger } from "./logger";

type ActionContext = {
  user: {
    id: string;
    role: string;
    onboardingCompleted: boolean;
  };
};

export function authenticatedAction<TArgs extends any[], TReturn>(
  allowedRoles: string[] = ['BUYER', 'AGENT', 'BUILDER', 'ADMIN', 'SUPER_ADMIN'],
  handler: (context: ActionContext, ...args: TArgs) => Promise<TReturn>
) {
  return async (...args: TArgs) => {
    try {
      const session = await auth();
      if (!session || !session.user || !session.user.id) {
        throw new UnauthorizedError('You must be logged in to perform this action.');
      }

      const role = (session.user as any).role;
      if (!allowedRoles.includes(role)) {
        throw new ForbiddenError('You do not have permission to perform this action.');
      }

      const context: ActionContext = {
        user: {
          id: session.user.id,
          role: role,
          onboardingCompleted: (session.user as any).onboardingCompleted || false,
        }
      };

      const result = await handler(context, ...args);
      return { success: true, data: result };
    } catch (error: any) {
      // In production, we'd log this securely
      logger.error("[Action Error]", { 
        error: error instanceof Error ? { message: error.message, stack: error.stack } : error 
      });

      if (error instanceof AppError) {
        return { success: false, error: error.message, code: error.code };
      }

      return { success: false, error: 'An unexpected error occurred.', code: 'INTERNAL_ERROR' };
    }
  };
}
