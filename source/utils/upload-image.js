const multer = require('multer');
const path = require('path');
let fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const productId = req.body.productId;
        const root = req.root.folder;

        let uploadPath = './public/uploads/';

        if (root === 'accounts') {
            uploadPath += `${root}/`;
        } else if (root === 'product_variants') {
            uploadPath += `${root}/${productId}`;
        }

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const root = req.root.folder;

        const fileExtension = path.extname(file.originalname);
        let fileName = path.basename(file.originalname, fileExtension);

        if (root === 'accounts') {
            fileName = req.body.Id;
        } else if (root === 'product_variants') {
            fileName = req.body.barcode;
        }

        cb(null, `${fileName}-${Date.now()}${fileExtension}`);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['.png', '.jpg'];
        const extname = path.extname(file.originalname).toLowerCase();

        if (!allowed.includes(extname)) {
            return cb(new Error('Image must have ".png" or ".jpg" extension'));
        } else {
            return cb(null, true);
        }
    },
});

module.exports = upload;