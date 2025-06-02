import { Router } from 'express';
import { LessonController } from '../controllers/LessonController';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/auth'; // To be added later for access control
import { authorizeRole } from '../middleware/rbac'; // To be added later for role-based access control

// Создаем папку uploads, если она не существует (ensure this is consistent with post route or centralize)
const uploadsDir = path.join(__dirname, '../uploads') // Adjust path if necessary
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Настройка multer для загрузки файлов (ensure this is consistent or centralize)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const originalname = file.originalname;
    const ext = path.extname(originalname);
    const name = path.parse(originalname).name;
    // Sanitize the filename to remove potentially problematic characters
    const sanitizedName = name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const uniqueName = `${Date.now()}_${sanitizedName}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // Increased limit for potentially larger educational files (50MB)
  },
  // fileFilter: ... // Add file filter if needed
});

const router = Router();
const lessonController = new LessonController();

router.post('/', authenticateToken, authorizeRole(['teacher', 'super-admin']), lessonController.create.bind(lessonController));
router.get('/', lessonController.getAll.bind(lessonController));
router.get('/:id', lessonController.getById.bind(lessonController));
router.put('/:id', authenticateToken, authorizeRole(['teacher', 'super-admin']), lessonController.update.bind(lessonController));
router.delete('/:id', authenticateToken, authorizeRole(['teacher', 'super-admin']), lessonController.delete.bind(lessonController));

// Route to upload files to a specific lesson
router.post('/:id/files', authenticateToken, authorizeRole(['teacher', 'super-admin']), upload.array('lessonFiles'), lessonController.uploadFileToLesson.bind(lessonController));

// Route to get files for a specific lesson
router.get('/:id/files', lessonController.getLessonFiles.bind(lessonController));

// Consider adding a dedicated route for downloading individual files by ID if needed, 
// similar to the post download route, but using the File entity and its path.

export default router; 