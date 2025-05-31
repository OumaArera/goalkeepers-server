const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const mime = require('mime-types');
const { Readable } = require('stream');

// Load credentials
const KEYFILEPATH = path.join(__dirname, '../config/driveuploaderapp-461513-3608c3cbe01e.json');

// Scopes for full access to drive
const SCOPES = ['https://www.googleapis.com/auth/drive'];

// Drive folder ID (replace with your actual shared folder ID)
const FOLDER_ID = process.env.FOLDER_ID;

// Auth
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

// Google Drive client
const driveService = google.drive({ version: 'v3', auth });

/**
 * Uploads an array of files to Google Drive and returns public URLs.
 * @param {Array} files - Array of files (e.g., from multer)
 * @returns {Promise<string[]>}
 */

const uploadFilesToDrive = async (files) => {
  const uploadedUrls = [];

  for (const file of files) {
    const fileMetadata = {
      name: file.originalname,
      parents: [FOLDER_ID],
    };

    // Convert buffer to stream
    const bufferStream = new Readable();
    bufferStream.push(file.buffer);
    bufferStream.push(null);

    const media = {
      mimeType: file.mimetype,
      body: bufferStream,
    };

    const response = await driveService.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    const fileId = response.data.id;

    // Make the file public
    await driveService.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const publicUrl = `https://drive.google.com/uc?id=${fileId}`;
    uploadedUrls.push(publicUrl);
  }

  return uploadedUrls;
};


module.exports = {
  uploadFilesToDrive,
};
