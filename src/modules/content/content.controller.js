export const streamContent = async (req, res) => {
  const { contentId } = req.params;
  const userId = req.user.userId;

  const content = await Content.findById(contentId);
  if (!content) return res.status(404).send("Not found");

  if (!content.allowedUsers.includes(userId))
    return res.status(403).send("Unauthorized");

  // Decrypt and stream securely
};