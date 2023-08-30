const { getUsers, getUser, createUser, updateProfile, updateAvatar } = require('../controllers/users')

const router = require('express').Router();

router.get("/users", getUsers);
router.get('/users/:userId', getUser);
router.patch('/users/me', updateProfile);
router.patch('/users/me/avatar', updateAvatar);
router.post('/users', createUser);


module.exports = router;