import { prisma } from "../../lib/prisma";

const createComment = async (payload: {
  content: string;
  authorId: string;
  postId: string;
  parentId: string;
}) => {
  //   console.log(payload)

  await prisma.post.findFirstOrThrow({
    where: {
      id: payload.postId,
    },
  });

  if (payload.parentId) {
    await prisma.comments.findFirstOrThrow({
      where: {
        id: payload.parentId,
      },
    });
  }
  return await prisma.comments.create({
    data: payload,
  });
};

export const commentService = {
  createComment,
};
