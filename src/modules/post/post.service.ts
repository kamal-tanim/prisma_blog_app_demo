import { Post } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createPost = async (
  data: Omit<Post, "id" | "createdAt" | "updatedAt">,
) => {
  const result = prisma.post.create({
    data,
  });

  return result;
};

export const postServer = {
  createPost,
};
