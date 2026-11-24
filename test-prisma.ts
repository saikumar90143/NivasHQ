import { db } from "./src/lib/db";

async function main() {
  try {
    const property = await db.property.findUnique({
      where: { slug: "test" },
      include: {
        images: true,
        locality: true,
        city: true,
        agent: {
          include: { user: true }
        },
        builder: {
          include: { user: true }
        },
        amenities: {
          include: { amenity: true }
        },
      },
    });
    console.log("Success:", property);
  } catch (error) {
    console.error("Prisma error:", error);
  } finally {
    await db.$disconnect();
  }
}

main();
