const express = require('express');
const Nedb = require('nedb');
const multer = require('multer');
const path = require('path');
const app = express();

// Настройка базы данных
const db = new Nedb({ filename: 'db/photos.db', autoload: true });

// Настройка загрузки файлов
const storage = multer.diskStorage({
  destination: './public/images/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Маршруты
app.get('/photos', (req, res) => {
  db.find({}).sort({ date: -1 }).exec((err, docs) => {
    if (err) return res.status(500).send(err);
    res.json(docs);
  });
});

app.post('/upload', upload.single('photo'), (req, res) => {
  const photoData = {
    filename: req.file.filename,
    description: req.body.description,
    date: req.body.date,
    uploadedAt: new Date(),
  };
  db.insert(photoData, (err, newDoc) => {
    if (err) return res.status(500).send(err);
    res.json(newDoc);
  });
});

app.post('/delete', (req, res) => {
  db.remove({ _id: req.body.id }, {}, (err, numRemoved) => {
    if (err) return res.status(500).send(err);
    res.json({ success: numRemoved > 0 });
  });
});

app.listen(3000, () => console.log('Server started on http://localhost:3000'));