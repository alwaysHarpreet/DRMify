import * as ContentService from "./content.service.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export const streamContent = async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const user = req.user;

    const record = ContentService.getContentRecord(contentId);
    if (!record) return res.status(404).json({ error: "Not found" });

    await ContentService.streamContentToResponse(contentId, res, user);
  } catch (err) {
    next(err);
  }
};

export const uploadContent = [
  upload.single("file"),
  async (req, res, next) => {
    try {
      const file = req.file;
      const { title } = req.body;
      const user = req.user;

      if (!file) return res.status(400).json({ error: "File required" });

      const result = await ContentService.uploadContent({
        fileBuffer: file.buffer,
        filename: file.originalname,
        title: title || file.originalname,
        uploadedBy: user.userId,
        userEmail: user.email || ""
      });

      res.status(201).json({ message: "Uploaded", content: result });
    } catch (err) {
      next(err);
    }
  }
];