const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Profile = require("../models/Profile");

router.post("/userdetails", async (req, res) => {
  console.log("Fetching user details for:", req.body.UserId);
  const id = req.body.UserId;

  try {
    const Data = await User.findOne({ _id: id }).select("-password");
    console.log("User data found:", Data);

    const userProfile = await Profile.find({ userId: id });
    console.log("User profile found:", userProfile);

    res.send({ Data, userProfile });
  } catch (error) {
    console.log("Error fetching user details:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update user details (name, mobile)
router.post("/updateuserdetails", async (req, res) => {
  console.log("=== UPDATE USER DETAILS ===");
  console.log("Request body:", req.body);
  const { UserId, first_name, last_name, mob } = req.body;

  if (!UserId) {
    console.log("Error: No UserId provided");
    return res.status(400).json({ success: false, message: "UserId is required" });
  }

  try {
    // First find the user to confirm they exist
    const existingUser = await User.findOne({ _id: UserId });
    console.log("Existing user:", existingUser);

    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Prepare update object only with fields that are provided
    const updateFields = {};
    if (first_name) updateFields.first_name = first_name;
    if (last_name) updateFields.last_name = last_name;
    if (mob) updateFields.mob = mob;

    console.log("Fields to update:", updateFields);

    const updatedUser = await User.findByIdAndUpdate(
      UserId,
      updateFields,
      { new: true }
    ).select("-password");

    console.log("Updated user:", updatedUser);
    res.json({ success: true, user: updatedUser });

  } catch (error) {
    console.log("Update error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
