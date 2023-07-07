const router = require("express").Router();
const User = require("../models/Users");
const bcrypt = require("bcrypt");

//Update User
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.user.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json({ err });
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account has been Updated");
    } catch (err) {
      return res.status(500).json({ err });
    }
  } else {
    res.status(400).json({ msg: "You can update only your account" });
  }
});

//Delete User
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.deleteOne({ _id: req.params.id });
      res.status(200).json("Account has been Deleted");
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(400).json({ msg: "You can delete only your account" });
  }
});

//Get a User
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json({ other });
  } catch (err) {
    res.status(500).json({ err });
  }
});

//follow a User
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { following: req.params.id } });
        res
          .status(200)
          .json({ msg: `User has been followed with id ${req.params.id}` });
      } else {
        res.status(403).json({ msg: `You already follow ` });
      }
    } catch (err) {
      res.status(500).json({ err });
    }
  } else {
    res.status(403).json({ msg: "You cannot follow yourself" });
  }
});

//unfollow a User
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { following: req.params.id } });
        res
          .status(200)
          .json({ msg: `User has been unfollowed with id ${req.params.id}` });
      } else {
        res.status(403).json({ msg: `You already are not following ` });
      }
    } catch (err) {
      res.status(500).json({ err });
    }
  } else {
    res.status(403).json({ msg: "You cannot Unfollow yourself" });
  }
});

module.exports = router;
