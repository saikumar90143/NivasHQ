import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import BuyerDashboardClient from "./BuyerDashboardClient";

export default async function BuyerDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const favorites = await db.favorite.findMany({
    where: { userId },
    include: {
      property: {
        include: {
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
          city: true,
          locality: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const appointments = await db.appointment.findMany({
    where: { userId },
    include: {
      property: {
        include: {
          images: { take: 1, orderBy: { sortOrder: 'asc' } }
        }
      },
      agent: {
        include: { user: true }
      }
    },
    orderBy: { scheduledDate: 'desc' }
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-[#0f172a] mb-8">My Buyer Dashboard</h1>
      <BuyerDashboardClient 
        initialFavorites={JSON.parse(JSON.stringify(favorites))} 
        initialAppointments={JSON.parse(JSON.stringify(appointments))} 
      />
    </div>
  );
}
