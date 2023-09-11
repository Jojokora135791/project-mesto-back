const { getCurrentUser, getUsers, getUser, updateProfile, updateAvatar } = require('../controllers/users')

const router = require('express').Router();

router.get("/users", getUsers);
router.get("/users/me", getCurrentUser);
router.get('/users/:userId', getUser);
router.patch('/users/me', updateProfile);
router.patch('/users/me/avatar', updateAvatar);

module.exports = router;