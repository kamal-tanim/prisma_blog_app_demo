import { Request, Response } from "express";
import { postService } from "./post.service";

const createPost = async (req: Request, res: Response) => {
  try {
    // const user = req.user

    if (!req.user) {
      return res.status(400).json({
        error: "Post creation failed",
      });
    }
    const result = await postService.createPost(
      req.body,
      req.user.id as string,
    );
    res.status(201).json({ result });
  } catch (error) {
    res.status(400).json({
      error: "Post creation failed",
      details: error,
    });
  }
};

const getAllPost = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    console.log(search);

    const searchString = typeof search === "string" ? search : undefined;
    const tags = req.query.tags ? (req.query.tags as string).split(",") : [];


    const result = await postService.getAllPost({ search: searchString , tags});
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      error: "failed to fetch all post",
      details: error,
    });
  }
};

export const postController = {
  createPost,
  getAllPost,
};
