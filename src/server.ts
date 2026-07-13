import app from "./app";
import { prisma } from "./lib/prisma";

const port = process.env.PORT || 3000;

async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to database successfully.");

    app.listen(port, () => {
      console.log(`Server Is Running On Port: ${port}`);
    });
  } catch (error) {
    console.error("an error occurred", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}
main();
