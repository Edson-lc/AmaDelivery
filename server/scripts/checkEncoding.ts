import prisma from '../src/lib/prisma';

async function main() {
  const menuItems = await prisma.menuItem.findMany({
    select: { nome: true },
    orderBy: { nome: 'asc' },
  });

  console.log('Menu Items:', menuItems.map((item) => item.nome));

  const encoding = await prisma.$queryRawUnsafe("SHOW SERVER_ENCODING;");
  console.log('Server encoding:', encoding);
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
