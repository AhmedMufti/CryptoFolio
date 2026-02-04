const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");

router.post("/profileupdate", async (req, res) => {
  console.log("Profile update section");
  console.log("User ID:", req.body.UserId);
  console.log("Profile URL:", req.body.ProfileUrl);

  try {
    const userId = req.body.UserId;
    const profileUrl = req.body.ProfileUrl;

    if (!userId || !profileUrl) {
      return res.status(400).json({ error: "Missing UserId or ProfileUrl" });
    }

    // Check if profile exists for this user
    const existingProfile = await Profile.findOne({ userId: userId });

    if (existingProfile) {
      // Update existing profile
      const result = await Profile.updateOne(
        { userId: userId },
        { $set: { url: profileUrl } }
      );
      console.log("Profile updated:", result);
    } else {
      // Create new profile
      const newProfile = new Profile({
        userId: userId,
        url: profileUrl
      });
      const result = await newProfile.save();
      console.log("New profile created:", result);
    }

    res.json({ success: true, UserId: userId, url: profileUrl });

  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
