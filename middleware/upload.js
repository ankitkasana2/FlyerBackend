import multer from "multer";
import path from "path";
import fs from "fs";

// Create folders if not exist
const createFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
};

// Venue logo
createFolder("./uploads/venue_logo");
createFolder("./uploads/djs");
createFolder("./uploads/host");
createFolder("./uploads/sponsors");

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname.startsWith("venue_logo")) cb(null, "./uploads/venue_logo");
    else if (file.fieldname.startsWith("dj")) cb(null, "./uploads/djs");
    else if (file.fieldname.startsWith("host")) cb(null, "./uploads/host");
    else if (file.fieldname.startsWith("sponsor")) cb(null, "./uploads/sponsors");
    else cb(null, "./uploads/others");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    // We will rename files later based on order ID
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

export const upload = multer({ storage });
