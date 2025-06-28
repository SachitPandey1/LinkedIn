import uploadOnCloudinary from "../config/cloudinary.js";
import User from "../models/user.model.js";


export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return res.status(500).json({ message: "Error fetching user." });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, userName, headline, location, gender } = req.body;
    const skills = req.body.skills ? JSON.parse(req.body.skills) : [];
    const education = req.body.education ? JSON.parse(req.body.education) : [];
    const experience = req.body.experience ? JSON.parse(req.body.experience) : [];

    let profileImage, coverImage;

    if (req.files?.profileImage?.[0]) {
      profileImage = await uploadOnCloudinary(req.files.profileImage[0].path);
    }

    if (req.files?.coverImage?.[0]) {
      coverImage = await uploadOnCloudinary(req.files.coverImage[0].path);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        firstName,
        lastName,
        userName,
        headline,
        location,
        gender,
        skills,
        education,
        experience,
        ...(profileImage && { profileImage }),
        ...(coverImage && { coverImage })
      },
      { new: true }
    ).select("-password");

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateProfile:", error);
    return res.status(500).json({ message: `Update profile failed: ${error.message}` });
  }
};


export const getprofile = async (req, res) => {
  try {
    const { userName } = req.params;
    const user = await User.findOne({ userName }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Username not found." });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in getprofile:", error);
    return res.status(500).json({ message: "Error retrieving profile." });
  }
};


export const search = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Search query is required." });
    }

    const users = await User.find({
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { userName: { $regex: query, $options: "i" } },
        { skills: { $in: [query] } }
      ]
    }).select("-password");

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error in search:", error);
    return res.status(500).json({ message: "Search failed." });
  }
};


export const getSuggestedUser = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId).select("connection");

    const suggestedUsers = await User.find({
      _id: { $ne: req.userId, $nin: currentUser.connection }
    }).select("-password");

    return res.status(200).json(suggestedUsers);
  } catch (error) {
    console.error("Error in getSuggestedUser:", error);
    return res.status(500).json({ message: "Fetching suggested users failed." });
  }
};
