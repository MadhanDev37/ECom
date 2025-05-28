import multer from "multer";

import path from "path";
import { fileURLToPath } from "url";
const filename=fileURLToPath(import.meta.url);
const __dirname= path.dirname(filename);
console.log(__dirname);
const fileStorage= multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,path.join(__dirname, '..', 'images'))
    },
    filename:(req,file,cb) => {
        cb(null,new Date().toISOString().replace(/:/g,'-')+'-'+file.originalname)
    }
})

const fileFilter =  (req,file,cb)=>{
    if(file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp')
    {
        cb(null,true);
    }
    else
    {
        cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed.'), false);
    }
}
export const upload = multer({
    storage: fileStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
});