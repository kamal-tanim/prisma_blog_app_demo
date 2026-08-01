import { NextFunction, Request, Response } from "express";
import { postService } from "./post.service";
import { PostStatus } from "../../../generated/prisma/enums";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";
import { UserRole } from "../../enum/UserRole";

const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const user = req.user

    if (!req.user) {
      return res.status(400).json({
        error: "Post creation failed",
      });
    }

    // console.log(req.user.id)
    const result = await postService.createPost(
      req.body,
      req.user.id as string,
    );
    res.status(201).json({ result });
  } catch (error) {
    next(error)
  }
};

const getAllPost = async (req: Request, res: Response , next: NextFunction) => {
  try {
    const { search } = req.query;

    const searchString = typeof search === "string" ? search : undefined;
    const tags = req.query.tags ? (req.query.tags as string).split(",") : [];

    const isFeatured = req.query.isFeatured
      ? req.query.isFeatured === "true"
        ? true
        : req.query.isFeatured === "false"
          ? false
          : undefined
      : undefined;

    const status = req.query.status as PostStatus | undefined;

    const authorId = req.query.authorId as string | undefined;

    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(
      req.query,
    );

    // console.log(options);

    const result = await postService.getAllPost({
      search: searchString,
      tags,
      isFeatured,
      status,
      authorId,
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getMyPost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const result = await postService.getMyPost(user?.id as string);

    res.status(201).json({ result });
  } catch (error) {
    res.status(400).json({
      error: "Post fetched failed",
      details: error,
    });
  }
};

const getPostById = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      throw new Error("post id required");
    }
    const result = await postService.getPostById(postId as string);

    res.status(201).json({ result });
  } catch (error) {
    res.status(400).json({
      error: "Post fetched failed",
      details: error,
    });
  }
};

const updatePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const data = req.body;
    const user = req.user;
    const isAdmin = user?.role === UserRole.ADMIN;

    if (!postId) {
      throw new Error("post id required");
    }
    const result = await postService.updatePost(
      postId as string,
      data,
      user?.id as string,
      isAdmin,
    );

    res.status(200).json({ result });
  } catch (error) {
    res.status(400).json({
      error: "Post update failed",
      details: error,
    });
  }
};

const deletePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const user = req.user;
    const isAdmin = user?.role === UserRole.ADMIN;

    if (!postId) {
      throw new Error("post id required");
    }
    const result = await postService.deletePost(
      postId as string,
      user?.id as string,
      isAdmin,
    );

    res.status(200).json({ result });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "status update failed";
    res.status(400).json({
      message: errorMessage,
      details: error,
    });
  }
};

const postStats = async (req: Request, res: Response) => {
  try {
    const result = await postService.postStats();
    res.status(200).json({ result });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "posts stats fetched failed";
    console.log(error);
    res.status(400).json({
      message: errorMessage,
      details: error,
    });
  }
};

export const postController = {
  createPost,
  getAllPost,
  getPostById,
  getMyPost,
  updatePost,
  deletePost,
  postStats,
};
