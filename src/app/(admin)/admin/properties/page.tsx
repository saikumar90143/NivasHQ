import { getAuthenticatedUser } from '@/lib/api-helpers';
import { requirePermission } from '@/lib/permissions';
import { db } from '@/lib/db';
import PropertyModerationTable from '@/components/admin/PropertyModerationTable';

export const metadata = {
  title: 'Property Moderation | NivasaHQ Admin',
};

export default async function AdminPropertiesPage() {
  const user = await getAuthenticatedUser(null as any);
  requirePermission(user.role, 'admin.access');

  const properties = await db.property.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      agent: { include: { user: true } },
      builder: { include: { user: true } },
      owner: true,
      locality: true,
      city: true,
    },
  });

  const serializedProperties = properties.map((p) => ({
    ...p,
    price: p.price.toString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-display-lg text-gradient-navy">Property Moderation</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Review, approve, or reject property listings to maintain quality standards.
          </p>
        </div>
      </div>

      <div className="glass shadow-card rounded-2xl overflow-hidden border border-border/50">
        <PropertyModerationTable properties={serializedProperties} />
      </div>
    </div>
  );
}
