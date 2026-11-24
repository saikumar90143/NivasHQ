import { PrismaClient, Role, UserStatus, VerificationStatus, LocationLevel, ListingType, PropertyType, PropertyStatus, Facing, Furnishing, PossessionStatus, ConstructionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEFAULT_AMENITIES = [
  { name: "Parking", slug: "parking", icon: "car", category: "basic" },
  { name: "Power Backup", slug: "power-backup", icon: "zap", category: "basic" },
  { name: "Lift", slug: "lift", icon: "arrow-up-down", category: "basic" },
  { name: "Water Supply", slug: "water-supply", icon: "droplets", category: "basic" },
  { name: "Gas Pipeline", slug: "gas-pipeline", icon: "flame", category: "basic" },
  { name: "Swimming Pool", slug: "swimming-pool", icon: "waves", category: "lifestyle" },
  { name: "Gym", slug: "gym", icon: "dumbbell", category: "lifestyle" },
  { name: "Clubhouse", slug: "clubhouse", icon: "home", category: "lifestyle" },
  { name: "Garden", slug: "garden", icon: "trees", category: "lifestyle" },
  { name: "Children Play Area", slug: "children-play-area", icon: "baby", category: "lifestyle" },
  { name: "Jogging Track", slug: "jogging-track", icon: "footprints", category: "sports" },
  { name: "Indoor Games", slug: "indoor-games", icon: "gamepad-2", category: "sports" },
  { name: "Tennis Court", slug: "tennis-court", icon: "circle-dot", category: "sports" },
  { name: "Basketball Court", slug: "basketball-court", icon: "circle", category: "sports" },
  { name: "CCTV", slug: "cctv", icon: "camera", category: "safety" },
  { name: "Security", slug: "security", icon: "shield-check", category: "safety" },
  { name: "Gated Community", slug: "gated-community", icon: "lock", category: "safety" },
  { name: "Fire Safety", slug: "fire-safety", icon: "flame-kindling", category: "safety" },
  { name: "Intercom", slug: "intercom", icon: "phone", category: "safety" },
  { name: "Visitor Parking", slug: "visitor-parking", icon: "parking-circle", category: "convenience" },
  { name: "Maintenance Staff", slug: "maintenance-staff", icon: "wrench", category: "convenience" },
  { name: "Rain Water Harvesting", slug: "rain-water-harvesting", icon: "cloud-rain", category: "convenience" },
  { name: "Waste Management", slug: "waste-management", icon: "trash-2", category: "convenience" },
  { name: "EV Charging", slug: "ev-charging", icon: "plug-zap", category: "convenience" },
];

const LOCALITIES = [
  "Gachibowli", "HITEC City", "Kokapet", "Narsingi", "Tellapur",
  "Kondapur", "Madhapur", "Manikonda", "Banjara Hills", "Jubilee Hills",
  "Shamshabad", "Kompally", "Kukatpally", "Miyapur", "LB Nagar",
  "Secunderabad", "Begumpet", "Ameerpet", "Film Nagar", "Tolichowki"
];

function generateSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function main() {
  console.log('Starting seed...');

  // 1. Geography
  console.log('Seeding geography...');
  const state = await prisma.location.upsert({
    where: { slug_level_parentId: { slug: 'telangana', level: LocationLevel.STATE, parentId: '' } },
    update: {},
    create: {
      name: 'Telangana',
      slug: 'telangana',
      level: LocationLevel.STATE,
    }
  });

  const city = await prisma.location.upsert({
    where: { slug_level_parentId: { slug: 'hyderabad', level: LocationLevel.CITY, parentId: state.id } },
    update: {},
    create: {
      name: 'Hyderabad',
      slug: 'hyderabad',
      level: LocationLevel.CITY,
      parentId: state.id,
      isPopular: true
    }
  });

  const zones = ['West', 'Central', 'East', 'North', 'South'];
  for (const zoneName of zones) {
    await prisma.location.upsert({
      where: { slug_level_parentId: { slug: generateSlug(`${zoneName} Zone Hyderabad`), level: LocationLevel.ZONE, parentId: city.id } },
      update: {},
      create: {
        name: `${zoneName} Zone`,
        slug: generateSlug(`${zoneName} Zone Hyderabad`),
        level: LocationLevel.ZONE,
        parentId: city.id
      }
    });
  }

  const createdLocalities: any[] = [];
  for (const locName of LOCALITIES) {
    const slug = generateSlug(locName);
    const loc = await prisma.location.upsert({
      where: { slug_level_parentId: { slug, level: LocationLevel.LOCALITY, parentId: city.id } },
      update: {},
      create: {
        name: locName,
        slug,
        level: LocationLevel.LOCALITY,
        parentId: city.id,
        isPopular: true,
        avgPricePerSqft: Math.floor(Math.random() * (12000 - 4000) + 4000)
      }
    });
    createdLocalities.push(loc);
  }

  // 2. Amenities
  console.log('Seeding amenities...');
  const createdAmenities: any[] = [];
  for (const amenity of DEFAULT_AMENITIES) {
    const am = await prisma.amenity.upsert({
      where: { slug: amenity.slug },
      update: {},
      create: {
        name: amenity.name,
        slug: amenity.slug,
        icon: amenity.icon,
        category: amenity.category
      }
    });
    createdAmenities.push(am);
  }

  // 3. Admin User
  console.log('Seeding users...');
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@nivasahq.com' },
    update: {},
    create: {
      email: 'admin@nivasahq.com',
      name: 'Admin',
      passwordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      onboardingCompleted: true,
      emailVerified: new Date()
    }
  });

  // Agents
  const agentNames = [
    { name: 'Rajesh Kumar', phone: '+919876543210' },
    { name: 'Priya Sharma', phone: '+919876543211' },
    { name: 'Anil Reddy', phone: '+919876543212' },
    { name: 'Sunita Rao', phone: '+919876543213' },
    { name: 'Mohammad Ali', phone: '+919876543214' }
  ];
  const createdAgents: any[] = [];
  for (const [index, agentInfo] of agentNames.entries()) {
    const user = await prisma.user.upsert({
      where: { phone: agentInfo.phone },
      update: {},
      create: {
        name: agentInfo.name,
        phone: agentInfo.phone,
        email: `agent${index}@example.com`,
        passwordHash,
        role: Role.AGENT,
        status: UserStatus.ACTIVE,
        onboardingCompleted: true,
        agent: {
          create: {
            companyName: `${agentInfo.name} Real Estate`,
            licenseNumber: `LIC-1000${index}`,
            experienceYears: Math.floor(Math.random() * (12 - 3) + 3),
            verificationStatus: VerificationStatus.VERIFIED,
            rating: 4.0 + (Math.random() * 0.9)
          }
        }
      },
      include: { agent: true }
    });
    createdAgents.push(user.agent);

    // Assign AgentAreaServed
    for (let i = 0; i < 3; i++) {
      const randomLoc = createdLocalities[Math.floor(Math.random() * createdLocalities.length)];
      await prisma.agentAreaServed.upsert({
        where: { agentId_localityId: { agentId: user.agent!.id, localityId: randomLoc.id } },
        update: {},
        create: {
          agentId: user.agent!.id,
          localityId: randomLoc.id
        }
      });
    }
  }

  // Builders
  const builders = [
    { name: 'Prestige Realty', slug: 'prestige-realty' },
    { name: 'MyHome Constructions', slug: 'myhome-constructions' }
  ];
  const createdBuilders: any[] = [];
  for (const bInfo of builders) {
    const user = await prisma.user.upsert({
      where: { email: `${bInfo.slug}@example.com` },
      update: {},
      create: {
        name: bInfo.name,
        email: `${bInfo.slug}@example.com`,
        passwordHash,
        role: Role.BUILDER,
        status: UserStatus.ACTIVE,
        onboardingCompleted: true,
        builder: {
          create: {
            companyName: bInfo.name,
            slug: bInfo.slug,
            reraNumber: `RERA-TS-${Math.floor(Math.random() * 10000)}`,
            verificationStatus: VerificationStatus.VERIFIED,
            establishedYear: 2000 + Math.floor(Math.random() * 20)
          }
        }
      },
      include: { builder: true }
    });
    createdBuilders.push(user.builder);
  }

  // 4. Projects
  console.log('Seeding projects...');
  const pData = [
    {
      title: 'Prestige High Fields',
      builderId: createdBuilders[0].id,
      locality: 'Kokapet',
      startingPrice: BigInt(15000000),
      maxPrice: BigInt(35000000),
      possessionStatus: PossessionStatus.READY_TO_MOVE,
      isFeatured: true
    },
    {
      title: 'MyHome Apas',
      builderId: createdBuilders[1].id,
      locality: 'Narsingi',
      startingPrice: BigInt(8500000),
      maxPrice: BigInt(22000000),
      possessionStatus: PossessionStatus.UNDER_CONSTRUCTION,
      isFeatured: false
    },
    {
      title: 'Prestige Falcon City',
      builderId: createdBuilders[0].id,
      locality: 'Manikonda',
      startingPrice: BigInt(22000000),
      maxPrice: BigInt(55000000),
      possessionStatus: PossessionStatus.READY_TO_MOVE,
      isFeatured: false
    }
  ];

  const createdProjects: any[] = [];
  for (const pd of pData) {
    const loc = createdLocalities.find(l => l.name === pd.locality) || createdLocalities[0];
    const projSlug = generateSlug(pd.title);
    const proj = await prisma.project.upsert({
      where: { slug: projSlug },
      update: {},
      create: {
        title: pd.title,
        slug: projSlug,
        description: `Premium project in ${pd.locality}`,
        builderId: pd.builderId,
        localityId: loc.id,
        cityId: city.id,
        startingPrice: pd.startingPrice,
        maxPrice: pd.maxPrice,
        possessionStatus: pd.possessionStatus,
        status: PropertyStatus.ACTIVE,
        reraApproved: true,
        isFeatured: pd.isFeatured
      }
    });
    createdProjects.push(proj);
  }

  // 5. Properties
  console.log('Seeding properties...');
  // Type distribution: 12 APT, 5 VILLA, 4 PLOT, 3 IND, 1 PENT
  const types = [
    ...Array(12).fill(PropertyType.APARTMENT),
    ...Array(5).fill(PropertyType.VILLA),
    ...Array(4).fill(PropertyType.PLOT),
    ...Array(3).fill(PropertyType.INDEPENDENT_HOUSE),
    ...Array(1).fill(PropertyType.PENTHOUSE)
  ];
  
  // Listing types: 15 SALE, 10 RENT
  const listings = [
    ...Array(15).fill(ListingType.SALE),
    ...Array(10).fill(ListingType.RENT)
  ];

  let featuredCount = 0;
  let verifiedCount = 0;

  for (let i = 0; i < 25; i++) {
    const loc = createdLocalities[i % createdLocalities.length];
    const agent = createdAgents[i % createdAgents.length];
    const isSale = listings[i] === ListingType.SALE;
    const pType = types[i];
    const isFeatured = featuredCount < 6 ? true : false;
    const isVerified = verifiedCount < 15 ? VerificationStatus.VERIFIED : VerificationStatus.UNVERIFIED;
    
    if (isFeatured) featuredCount++;
    if (isVerified === VerificationStatus.VERIFIED) verifiedCount++;

    const price = isSale ? BigInt(Math.floor(Math.random() * (50000000 - 2500000) + 2500000)) 
                         : BigInt(Math.floor(Math.random() * (150000 - 15000) + 15000));
    const title = `${pType === PropertyType.APARTMENT ? '3 BHK ' : ''}${pType.replace('_', ' ')} in ${loc.name}`;
    
    await prisma.property.create({
      data: {
        slug: generateSlug(`${title}-${i}-${Date.now()}`),
        title,
        description: `Beautiful ${title} available for ${isSale ? 'Sale' : 'Rent'}. Includes great amenities and location.`,
        listingType: listings[i],
        propertyType: pType,
        status: PropertyStatus.ACTIVE,
        verificationStatus: isVerified,
        price,
        carpetArea: 1000 + Math.floor(Math.random() * 1000),
        bedrooms: pType === PropertyType.PLOT ? null : 3,
        bathrooms: pType === PropertyType.PLOT ? null : 2,
        facing: Facing.EAST,
        furnishing: pType === PropertyType.PLOT ? null : Furnishing.SEMI_FURNISHED,
        possessionStatus: PossessionStatus.READY_TO_MOVE,
        localityId: loc.id,
        cityId: city.id,
        stateId: state.id,
        agentId: agent.id,
        address: `123 Main Road, ${loc.name}, Hyderabad`,
        isFeatured,
        publishedAt: new Date(),
        images: {
          create: [
            {
              url: `https://res.cloudinary.com/xze4t0zx/image/upload/v1/properties/sample-${i + 1}.jpg`,
              isPrimary: true
            }
          ]
        },
        amenities: {
          create: createdAmenities.slice(0, 3).map(a => ({
            amenityId: a.id
          }))
        }
      }
    });
  }

  console.log('Seed completed successfully!');
  console.log('--- Summary ---');
  console.log(`Geography: 1 State, 1 City, 5 Zones, 20 Localities`);
  console.log(`Amenities: ${createdAmenities.length}`);
  console.log(`Users: 1 Admin, 5 Agents, 2 Builders`);
  console.log(`Projects: ${createdProjects.length}`);
  console.log(`Properties: 25 (15 Sale, 10 Rent)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
