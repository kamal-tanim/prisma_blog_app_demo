import express, { Router } from "express";
import { postController } from "./post.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../enum/UserRole";

const router = express.Router();

// get apis
router.get(
  "/my-post",
  auth(UserRole.USER, UserRole.ADMIN),
  postController.getMyPost,
);

router.get("/", postController.getAllPost);

router.get("/post-stats", auth(UserRole.ADMIN), postController.postStats);

router.get("/:postId", postController.getPostById);

// post apis
router.post(
  "/",
  auth(UserRole.USER, UserRole.ADMIN),
  postController.createPost,
);

//update apis
router.patch(
  "/:postId",
  auth(UserRole.USER, UserRole.ADMIN),
  postController.updatePost,
);

// delete apis
router.delete(
  "/:postId",
  auth(UserRole.USER, UserRole.ADMIN),
  postController.deletePost,
);

export const postRouter: Router = router;
