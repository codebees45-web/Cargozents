const express = require('express');
const {
  getAll,
  getOne,
  getStats,
  createOne,
  updateOne,
  deleteOne,
  registerUser,
  loginUser // 👈 1. Add loginUser here
} = require('../controllers/genericController');

const router = express.Router();

router.post('/signup', registerUser); 
router.post('/login', loginUser);

router.get('/stats/summary', getStats);
router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', createOne);
router.put('/:id', updateOne);
router.delete('/:id', deleteOne);

module.exports = router;