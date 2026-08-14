const express = require('express');

const router = express.Router();

router.get('/me', (req, res) => {
  const { firstname, branch, role } = req.user;
  res.json({ firstname, branch, role });
});

module.exports = router;
