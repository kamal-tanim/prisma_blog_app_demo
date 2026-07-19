import { Post } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createPost = async (
  data: Omit<Post, "id" | "createdAt" | "updatedAt">, userId : string
) => {
  const result = prisma.post.create({
    data: {
      ...data,
      authorId : userId
    }
  });

  return result;
};

export const postServer = {
  createPost,
};
