import { bucket } from "../config/firebase.js"; // Import Firebase storage bucket instance

export const uploadFile = async (data) => {

    if (!data) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Define the file path in Firebase Storage
    const fileName = `${Date.now()}_${data.originalname}`;
    const file = bucket.file(fileName);

    // Create a stream to upload file to Firebase Storage
    await new Promise((resolve, reject) => {
        const stream = file.createWriteStream({
            metadata: {
                contentType: data.mimetype,
            },
        });

        stream.on('error', (err) => {
            console.error('Error uploading file:', err);
            reject(err);
        });

        stream.on('finish', resolve);

        stream.end(data.buffer);
    });

    // Make the file public
    await file.makePublic();

    // Get the public URL
    const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

return fileUrl;

    
}