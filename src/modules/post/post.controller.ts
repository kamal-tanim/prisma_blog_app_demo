import { Request, Response } from "express";
import { postServer } from "./post.service";

const createPost = async (req: Request, res: Response) => {
  try {
    // const user = req.user

    if (!req.user) {
      return res.status(400).json({
        error: "Post creation failed",
      });
      
    } 
    const result = await postServer.createPost(req.body, req.user.id as string);
    res.status(201).json({ result });
  } catch (error) {
    res.status(400).json({
      error: "Post creation failed",
      details: error,
    });
  }
};

export const PostController = {
  createPost,
};
