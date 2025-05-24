// Flexible file storage utility for local and DigitalOcean Spaces (S3-compatible)
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Storage interface (for docs)
// saveFile(fileBuffer, originalFilename) => { fileName, filePath, url }
// getFileUrl(fileName) => url
// removeFile(fileName) => boolean

class LocalFileStorage {
  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'uploads');
    this.baseUrl = process.env.FILE_BASE_URL || '/uploads';
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      console.log(`Created upload directory: ${this.uploadDir}`);
    }
  }

  async saveFile(fileBuffer, originalFilename) {
    const fileExtension = path.extname(originalFilename);
    const fileBaseName = path.basename(originalFilename, fileExtension);
    const safeBaseName = fileBaseName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    const uniqueId = randomUUID().substring(0, 8);
    const timestamp = Date.now();
    const fileName = `${safeBaseName}-${timestamp}-${uniqueId}${fileExtension}`;
    const filePath = path.join(this.uploadDir, fileName);
    await fs.promises.writeFile(filePath, fileBuffer);
    return {
      fileName,
      filePath,
      url: `${this.baseUrl}/${fileName}`
    };
  }

  async getFileUrl(fileName) {
    return `${this.baseUrl}/${fileName}`;
  }

  async removeFile(fileName) {
    const filePath = path.join(this.uploadDir, fileName);
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error removing file ${fileName}:`, error);
      return false;
    }
  }
}

class S3FileStorage {
  constructor() {
    const accessKeyId = process.env.DO_SPACES_KEY || process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.DO_SPACES_SECRET || process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY;
    this.bucketName = process.env.DO_SPACES_BUCKET || process.env.NEXT_PUBLIC_S3_SPACE_BUCKET || '';
    this.region = process.env.DO_SPACES_REGION || process.env.NEXT_PUBLIC_S3_REGION || 'us-east-1';
    this.spacesEndpoint = process.env.DO_SPACES_ENDPOINT || process.env.NEXT_PUBLIC_S3_ENDPOINT || '';
    if (!accessKeyId || !secretAccessKey || !this.bucketName || !this.spacesEndpoint) {
      throw new Error('Digital Ocean Spaces credentials not properly configured');
    }
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      endpoint: this.spacesEndpoint, // should be region endpoint only, e.g. https://fra1.digitaloceanspaces.com
      region: this.region,
      forcePathStyle: false
    });
    console.log(`S3FileStorage initialized with bucket: ${this.bucketName}`);
  }

  async saveFile(fileBuffer, originalFilename) {
    try {
      const fileExtension = path.extname(originalFilename);
      const fileBaseName = path.basename(originalFilename, fileExtension);
      const safeBaseName = fileBaseName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
      const uniqueId = randomUUID().substring(0, 8);
      const timestamp = Date.now();
      const fileName = `${safeBaseName}-${timestamp}-${uniqueId}${fileExtension}`;
      const uploadParams = {
        Bucket: this.bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: this.getContentType(fileExtension),
        ACL: 'public-read' // Make file public
      };
      const command = new PutObjectCommand(uploadParams);
      await this.s3Client.send(command);
      const url = `https://${this.bucketName}.${this.region}.digitaloceanspaces.com/${fileName}`;
      return {
        fileName,
        filePath: fileName,
        url
      };
    } catch (error) {
      console.error('Error uploading file to Digital Ocean Spaces:', error);
      throw new Error('Failed to upload file to Digital Ocean Spaces');
    }
  }

  async getFileUrl(fileName) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileName
      });
      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
      return signedUrl;
    } catch (error) {
      console.error(`Error generating signed URL for ${fileName}:`, error);
      return `https://${this.bucketName}.${this.region}.digitaloceanspaces.com/${fileName}`;
    }
  }

  async removeFile(fileName) {
    try {
      const deleteParams = {
        Bucket: this.bucketName,
        Key: fileName,
      };
      const command = new DeleteObjectCommand(deleteParams);
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      console.error(`Error removing file ${fileName} from Digital Ocean Spaces:`, error);
      return false;
    }
  }

  getContentType(fileExtension) {
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif'
    };
    return contentTypes[fileExtension.toLowerCase()] || 'application/octet-stream';
  }
}

let fileStorageInstance = null;

export function getFileStorage() {
  if (fileStorageInstance) return fileStorageInstance;
  const forcedStorageType = 'spaces'; // Force Digital Ocean Spaces for now
  try {
    fileStorageInstance = new S3FileStorage();
    return fileStorageInstance;
  } catch (error) {
    console.error('Failed to initialize Digital Ocean Spaces storage:', error);
    fileStorageInstance = new LocalFileStorage();
    return fileStorageInstance;
  }
}

export const fileStorage = getFileStorage();

export { LocalFileStorage, S3FileStorage };

