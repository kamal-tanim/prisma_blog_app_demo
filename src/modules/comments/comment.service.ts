import { CommentStatus } from "../../../generated/prisma/enums";
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

const getCommentById = async (commentId: string) => {
  return await prisma.comments.findUnique({
    where: {
      id: commentId,
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          authorId: true,
          views: true,
        },
      },
    },
  });
};

const getCommentByAuthorId = async (authorId: string) => {
  return await prisma.comments.findMany({
    where: {
      authorId,
    },
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
};

const deleteComment = async (commentId: string, authorId: string) => {
  const commentData = await prisma.comments.findFirst({
    where: {
      id: commentId,
      authorId,
    },
    select: {
      id: true,
    },
  });
  if (!commentData) {
    throw new Error("vai comment delete hobe na oii dik jan apni");
  }

  return await prisma.comments.delete({
    where: {
      id: commentData.id,
    },
  });
};

const updateComment = async (
  commentId: string,
  data: { content?: string },
  authorId: string,
) => {
  const commentData = await prisma.comments.findFirst({
    where: {
      id: commentId,
      authorId,
    },
    select: {
      id: true,
    },
  });
  if (!commentData) {
    throw new Error("update kora jabe na bari jan apnni");
  }

  return await prisma.comments.update({
    where: {
      id: commentId,
      authorId,
    },
    data: {
      ...(data.content !== undefined && { content: data.content }),
    },
  });
};

const moderateComment = async (id: string, data: { status: CommentStatus }) => {
  const commentData = await prisma.comments.findFirst({
    where: {
      id,
    },
    select: {
      id: true,
      status: true
    }
  });

  if (commentData?.status === data.status) {
    throw new Error(
      `Your provided status ${data.status} is already up to date`,
    );
  }

  return await prisma.comments.update({
    where: {
      id,
    },
    data: {
      status: data.status,
    },
  });
};

export const commentService = {
  createComment,
  getCommentById,
  getCommentByAuthorId,
  deleteComment,
  updateComment,
  moderateComment,
};
