import { UserRole } from "../enum/UserRole";
import { prisma } from "../lib/prisma";

async function seedAdmin() {
  try {
    const adminData = {
      name: "Admin kamal",
      email: "admin@gmail.com",
      role: UserRole.ADMIN,
      password: "admin12345",
      emailVerified: true,
    };

    const existUser = await prisma.user.findUnique({
      where: {
        email: adminData.email,
      },
    });

    if (existUser) {
      await prisma.user.update({
        where: {
          email: adminData.email,
        },
        data: {
          emailVerified: true,
          role: UserRole.ADMIN,
        },
      });

      console.log("exists user set to the admin");
      return;
    }

    const singUpAdmin = await fetch(
      `http://localhost:3000/api/auth/sign-up/email`,

      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify(adminData),
      },
    );

    if (singUpAdmin.ok) {
      await prisma.user.update({
        where: {
          email: adminData.email,
        },
        data: {
          emailVerified: true,
        },
      });
    }

    console.log("create a new admin");
  } catch (error) {
    console.error(error);
  }
}

seedAdmin();
