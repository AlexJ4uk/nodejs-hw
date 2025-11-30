import createHttpError from 'http-errors';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { User } from '../models/user.js';

export const updateUserAvatar = async (req, res, next) => {
  try {
    if (!req.file) throw createHttpError(400, 'No file');

    const uploaded = await saveFileToCloudinary(req.file.buffer);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: uploaded.secure_url },
      { new: true },
    );

    res.json({ url: user.avatar });
  } catch (err) {
    next(err);
  }
};
