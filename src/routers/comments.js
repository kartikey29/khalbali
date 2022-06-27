const express = require("express");
const db = require("../db/index");
const checkModerator = require("../helperFunctions/checkModerator");
const passport = require("passport");
const { Sequelize } = require("sequelize");
const Comment = db.comment;
const CommentVote = db.commentvote;
const PostVote = db.vote;
const Post = db.post;
const User = db.user;
const Subreddit = db.subreddit;
// const doPagination = require("../helperFunctions/doPagination");

const router = express.Router();

//get all the comment data

router.get("/", async (req, res) => {
  try {
    const commentData = await Comment.findAll();
    res.send(commentData);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

//get post data with comment data using postId

router.get(
  "/:post_id",
  passport.authenticate(["jwt", "anonymous"], { session: false }),
  async (req, res) => {
    try {
      const { post_id } = req.params;
      const postData = await Post.findOne({
        where: { id: post_id },

        include: [
          { model: User, attributes: ["username"] },
          { model: Subreddit, attributes: ["name"] },
        ],
      });

      const votes = await PostVote.sum("vote_value", {
        where: {
          postId: postData.dataValues.id,
        },
      });
      postData.dataValues.postVotes = votes;

      const postComments = await Comment.count("id", {
        where: {
          postId: postData.dataValues.id,
        },
      });

      postData.dataValues.PostComments = postComments;

      if (!postData) {
        return res
          .status(404)
          .send({ error: "Could not find post with that id" });
      }

      if (req.user) {
        const Vote = await PostVote.findOne({
          where: {
            postId: postData.dataValues.id,
            userId: req.user.id,
          },
        });
        if (Vote) {
          postData.dataValues.hasVoted = parseInt(Vote.dataValues.vote_value);
        } else {
          postData.dataValues.hasVoted = 0;
        }
      }

      const whereClause = { postId: post_id };

      const commentData = await Comment.findAll({
        where: whereClause,
        include: [{ model: User, attributes: ["username"] }],
      });

      for (const comment of commentData) {
        const votes = await CommentVote.sum("vote_value", {
          where: {
            commentId: comment.dataValues.id,
          },
        });
        comment.dataValues.commentVotes = votes;
      }

      if (req.user) {
        for (const comment of commentData) {
          const Vote = await CommentVote.findOne({
            where: {
              commentId: comment.dataValues.id,
              userId: req.user.id,
            },
          });
          if (Vote) {
            comment.dataValues.hasVoted = parseInt(Vote.dataValues.vote_value);
          } else {
            comment.dataValues.hasVoted = 0;
          }
        }
      }
      res.send({
        postData,
        commentData,
      });
    } catch (e) {
      res.status(500).send({ error: e.message });
    }
  }
);

//comment on a post

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { body, postId, commentId } = req.body;
      if (!body) {
        throw new Error("Must specify comment body");
      }
      if (!postId) {
        throw new Error("Must specify post to comment on");
      }

      const newComment = await Comment.create({
        body: body,
        userId,
        postId: postId,
        commentId: commentId,
      });
      console.log(newComment);
      newComment.save();

      // Automatically upvote own comment

      const newCommentVote = await CommentVote.create({
        userId,
        commentId: newComment.id,
        vote_value: 1,
      });
      newCommentVote.save();

      const commentData = await Comment.findOne({
        where: { id: newComment.dataValues.id },
        include: [{ model: User, attributes: ["username"] }],
      });

      const votes = await CommentVote.sum("vote_value", {
        where: {
          commentId: commentData.dataValues.id,
        },
      });
      commentData.dataValues.commentVotes = votes;

      if (req.user) {
        const Vote = await CommentVote.findOne({
          where: {
            commentId: commentData.dataValues.id,
            userId: req.user.id,
          },
        });
        if (Vote) {
          commentData.dataValues.hasVoted = parseInt(
            Vote.dataValues.vote_value
          );
        } else {
          commentData.dataValues.hasVoted = 0;
        }
      }

      return res.send(commentData);
    } catch (e) {
      res.status(400).send({ error: e.message });
    }
  }
);

//edit a comment

router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { id } = req.params;

      const comment = await Comment.findOne({
        where: { id },
        include: [{ model: Post, include: [Subreddit] }],
      });

      const subredditName = comment.post.subreddit.name;

      if (!comment) {
        return res
          .status(404)
          .send({ error: "Could not find comment with that id" });
      }

      if (
        comment.userId !== req.user.id &&
        (await checkModerator(comment.userId, subredditName)) === false
      ) {
        return res
          .status(403)
          .send({ error: "You must the comment author to edit it" });
      }

      const updatedComment = await comment.update(req.body);
      return res.send(updatedComment);
    } catch (e) {
      res.status(400).send({ error: e.message });
    }
  }
);

//delete a comment

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const commentData = await Comment.findByPk(id, {
        include: [{ model: Post, include: [Subreddit] }],
      });
      console.log(commentData);
      if (!commentData) {
        return res
          .status(404)
          .send({ error: "Could not find comment with that id" });
      }

      const subredditName = commentData.post.subreddit.name;
      if (
        commentData.userId !== userId &&
        (await checkModerator(commentData.userId, subredditName)) === false
      ) {
        return res
          .status(403)
          .send({ error: "You must be the comment author to delete it" });
      }
      await Comment.destroy({ where: { id } });
      return res.status(200).send({ message: "deleted" });
    } catch (e) {
      res.status(400).send({ error: e.message });
    }
  }
);

module.exports = router;
