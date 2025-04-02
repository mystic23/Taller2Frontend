const express = require("express");
const Task = require("../models/Task");
const router = express.Router();

// Crear nueva tarea
router.post("/", async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener todas las tareas
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.findAll({
      order: [['createdAt', 'DESC']] // Ordenar por fecha de creación descendente
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener una tarea específica
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ error: "Tarea no encontrada" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar una tarea
router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (task) {
      await task.update(req.body);
      res.json(task);
    } else {
      res.status(404).json({ error: "Tarea no encontrada" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar una tarea
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (task) {
      await task.destroy();
      res.status(204).end();
    } else {
      res.status(404).json({ error: "Tarea no encontrada" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;