export type ACLUser = {
  id: string;
  role: string;
};

export type Resource = {
  agentId?: string | null;
  builderId?: string | null;
  userId?: string | null;
  [key: string]: any;
};

export const ACL = {
  /**
   * Determines if a user has permission to edit a specific resource (e.g., a Property).
   * Admins have universal access.
   * Agents and Builders can only edit resources they explicitly own.
   */
  canEditResource(user: ACLUser, resource: Resource): boolean {
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      return true;
    }

    if (resource.agentId === user.id || resource.builderId === user.id || resource.userId === user.id) {
      return true;
    }

    return false;
  },

  /**
   * Determines if a user has permission to delete a specific resource.
   */
  canDeleteResource(user: ACLUser, resource: Resource): boolean {
    // Reusing the same ownership logic for deletion in this context
    return this.canEditResource(user, resource);
  }
};
