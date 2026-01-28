import { Router } from "express";
import { 
  getTasks, 
  createTask, 
  updateTaskStatus, 
  deleteTask,
  getTasksByGarden,
  updateTask
} from "../controllers/task.controller.js";

const router = Router();

router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:id/status", updateTaskStatus);
router.delete("/:id", deleteTask);
router.get('/garden/:gardenId', getTasksByGarden);
router.put('/:id', updateTask);

export default router;