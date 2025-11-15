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

const router = express.Router();

router.get("/notes", celebrate(getAllNotesSchema), getAllNotes);
router.get("/notes/:noteId", celebrate(noteIdSchema), getNoteById);
router.post("/notes", celebrate(createNoteSchema), createNote);
router.patch("/notes/:noteId", celebrate(updateNoteSchema), updateNote);
router.delete("/notes/:noteId", celebrate(noteIdSchema), deleteNote);

export default router;
