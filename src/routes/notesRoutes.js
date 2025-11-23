import express from "express";
import {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from "../controllers/notesController.js";
import { celebrate } from "celebrate";
import { createNoteSchema, getAllNotesSchema, noteIdSchema, updateNoteSchema } from "../validations/notesValidation.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

router.get("/notes", authenticate, celebrate(getAllNotesSchema), getAllNotes);
router.get("/notes/:noteId", authenticate, celebrate(noteIdSchema), getNoteById);
router.post("/notes", authenticate, celebrate(createNoteSchema), createNote);
router.patch("/notes/:noteId", authenticate, celebrate(updateNoteSchema), updateNote);
router.delete("/notes/:noteId", authenticate, celebrate(noteIdSchema), deleteNote);

export default router;
