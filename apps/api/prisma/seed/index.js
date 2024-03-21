const { PrismaClient } = require('@prisma/client')
const fs = require('fs');
const {get} = require("axios");

const prisma = new PrismaClient({
  datasources: {
      db: {
        url: `${process.env.DATABASE_URL}?connection_limit=200&pool_timeout=90`,
      },
    }
  }
)

async function main() {
  try {
    const ctml_json = fs.readFileSync('database/ctml_schema.json', 'utf8');

    // const ctmlSchema = await prisma.ctml_schema.create({
    //   data: {
    //     version: 1,
    //     schema: ctml_json,
    //   },
    // });

    console.log('Database seeded successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().then(() => {
  console.log('done');
   populateGeneTable();
}).catch(e => {
  console.error(e)
}).finally(async () => {
  await prisma.$disconnect()
})

async function fetchHgncData() {
  try {
    const response = await get(
      'https://ftp.ebi.ac.uk/pub/databases/genenames/hgnc/json/hgnc_complete_set.json'
    );
    if (response.status != 200) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.data;
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function saveGenes(data) {
  console.log('finish fetching data, seeding gene table')
  try {
    data.response.docs.forEach(async (x) => {
      await prisma.gene.create({
        data: {
          hugoSymbol: x.symbol,
        },
      });
    });
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function populateGeneTable() {
  try {
    const data = await fetchHgncData();
    await saveGenes(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
}
