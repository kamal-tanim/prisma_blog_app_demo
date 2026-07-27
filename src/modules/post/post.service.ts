import {
  CommentStatus,
  Post,
  PostStatus,
} from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { UserRole } from "../../enum/UserRole";
import { prisma } from "../../lib/prisma";

const createPost = async (
  data: Omit<Post, "id" | "createdAt" | "updatedAt">,
  userId: string,
) => {
  return await prisma.post.create({
    data: {
      ...data,
      authorId: userId,
    },
  });
};

const getAllPost = async (payload: {
  search: string | undefined;
  tags: string[] | [];
  isFeatured: boolean | undefined;
  status: PostStatus | undefined;
  authorId: string | undefined;
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
}) => {
  const andConditions: PostWhereInput[] = [];

  if (payload.search) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: payload.search as string,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: payload.search as string,
            mode: "insensitive",
          },
        },
        {
          tags: {
            has: payload.search as string,
          },
        },
      ],
    });
  }

  if (payload.tags.length > 0) {
    andConditions.push({
      tags: {
        hasEvery: payload.tags as string[],
      },
    });
  }

  if (typeof payload.isFeatured === "boolean") {
    andConditions.push({
      isFeatured: payload.isFeatured,
    });
  }

  if (payload.status) {
    andConditions.push({ status: payload.status });
  }

  if (payload.authorId) {
    andConditions.push({
      authorId: payload.authorId,
    });
  }

  const allPost = await prisma.post.findMany({
    take: payload.limit,
    skip: payload.skip,
    where: {
      AND: andConditions,
    },
    orderBy: {
      [payload.sortBy]: payload.sortOrder,
    },
    include: {
      _count: {
        select: { comments: true },
      },
    },
  });

  const total = await prisma.post.count({
    where: {
      AND: andConditions,
    },
  });
  // console.log(total);
  return {
    data: allPost,
    total,
    page: payload.page,
    limit: payload.limit,
    totalPage: Math.ceil(total / payload.limit),
  };
};

const getPostById = async (postId: string) => {
  return await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: {
        id: postId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });
    const postData = await tx.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        comments: {
          where: {
            parentId: null,
            status: CommentStatus.APPROVED,
          },
          orderBy: { createdAt: "desc" },
          include: {
            replies: {
              orderBy: { createdAt: "asc" },
              where: {
                status: CommentStatus.APPROVED,
              },
              include: {
                replies: {
                  orderBy: { createdAt: "asc" },
                  where: {
                    status: CommentStatus.APPROVED,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
    return postData;
  });
};

const getMyPost = async (authorId: string) => {
  await prisma.user.findUniqueOrThrow({
    where: {
      id: authorId,
      status: "ACTIVE",
    },
    select: {
      id: true,
    },
  });

  const result = await prisma.post.findMany({
    where: {
      authorId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  const total = await prisma.post.count({
    where: {
      authorId,
    },
  });

  return {
    total,
    data: result,
  };
};

const updatePost = async (
  postId: string,
  data: Partial<Post>,
  authorId: string,
  isAdmin: boolean,
) => {
  const postData = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
    select: {
      id: true,
      authorId: true,
    },
  });
  if (!isAdmin && postData.authorId !== authorId) {
    throw new Error("unauthorized user!!! Unable to update post");
  }

  if (!isAdmin) {
    delete data.isFeatured;
  }

  const result = await prisma.post.update({
    where: {
      id: postData.id,
    },
    data,
  });

  return result;
};

const deletePost = async (
  postId: string,
  authorId: string,
  isAdmin: boolean,
) => {
  const postData = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
    select: {
      id: true,
      authorId: true,
    },
  });
  if (!isAdmin && postData.authorId !== authorId) {
    throw new Error("unauthorized user!!! Unable to delete post");
  }

  const result = await prisma.post.delete({
    where: {
      id: postData.id,
    },
  });

  return result;
};

const postStats = async () => {
  return await prisma.$transaction(async (statData) => {
    const [
      totalPost,
      publishedPosts,
      archivedPosts,
      draftPosts,
      totalComments,
      approvedComments,
      admins,
      users,
      totalViews,
    ] = await Promise.all([
      statData.post.count(),
      statData.post.count({
        where: { status: PostStatus.PUBLISHED },
      }),
      statData.post.count({
        where: { status: PostStatus.ARCHIVE },
      }),
      statData.post.count({
        where: { status: PostStatus.DRAFT },
      }),
      statData.comments.count(),
      statData.comments.count({
        where: { status: "APPROVED" },
      }),
      statData.user.count({
        where:{role: UserRole.ADMIN}
      }),
      statData.user.count({
        where:{role: UserRole.USER}
      }),
      statData.post.aggregate({
        _sum: { views: true}
      })
    ]);
    return {
      totalPost,
      publishedPosts,
      archivedPosts,
      draftPosts,
      totalComments,
      approvedComments,
      admins,
      users,
      totalViews: totalViews._sum.views
    };
  });
};

export const postService = {
  createPost,
  getAllPost,
  getPostById,
  getMyPost,
  updatePost,
  deletePost,
  postStats,
};
