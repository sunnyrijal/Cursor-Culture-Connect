import { PrismaClient } from '@prisma/client';
import { mockEvents } from '../../data/mockData.js';

const prisma = new PrismaClient();

async function main() {
  for (const event of mockEvents) {
    await prisma.event.create({
      data: {
        name: event.name,
        description: event.description,
        isRSVPed: event.isRSVPed,
        isFavorited: event.isFavorited,
        imageUrl: event.image,
        date: new Date(event.date),
        time: event.time,
        location: event.location,
        categories: event.category,
        organizer: event.organizer,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
