import multer from "multer";
import * as path from 'path'
import { __dirname } from "../path.js"

const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    let destination = path.join(__dirname, 'public', 'uploads', req.body.category)
    cb(null, destination)
  },
  filename: function (req, file, cb) {
    cb(null, `${req.params.uid}_${file.originalname}`)
  }
})

export const uploader = multer({ storage }) 