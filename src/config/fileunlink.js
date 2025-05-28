import fs from 'fs/promises'; 
import path from 'path';
import { fileURLToPath } from 'url';

export const deleteFile = async (filepath) => {
    const filename=fileURLToPath(import.meta.url);
    const __dirname=path.dirname(filename);
    const resolvedPath = path.join(__dirname, '..', filepath); 
  try {
    await fs.unlink(resolvedPath);
  } catch (error) {
    console.error(`Error deleting file: ${resolvedPath}`, error);
  }
};