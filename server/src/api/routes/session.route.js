import { Router } from 'express';
import { 
  createSession, 
  updateSessionStatus, 
  getSessions 
} from '../controllers/session.controller.js';
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorization.middleware.js";

const auth = [authenticate, authorize(["admin", "manager"])];

const router = Router();

router.post('/', auth, createSession);
router.put('/:id/status', auth, updateSessionStatus);
router.get('/', auth, getSessions);
router.get('/:id', auth, getSessions);

export default router;