import {Injectable,Logger,OnModuleInit,} from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

const mkdirAsync = promisify(fs.mkdir);
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);
const readdirAsync = promisify(fs.readdir);
const rmdirAsync = promisify(fs.rmdir);

export interface CloudinaryResponse {public_id: string;secure_url: string;[key: string]: any;}
@Injectable()
export class CloudinaryService implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryService.name);
  private isConfigured = false;
  constructor(private readonly configService: ConfigService) {}
  //============================================================================
  // Called once the module has been initialized by NestJS lifecycle
  onModuleInit() {this.configureCloudinary();}
  //============================================================================
  // Configures Cloudinary client with credentials from environment/config service
  private configureCloudinary() {
    const cloudName = this.configService.get('CLOUDINARY_NAME');
    const apiKey = this.configService.get('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.error('Cloudinary configuration is missing!');
      throw new Error('Cloudinary configuration is incomplete');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    this.isConfigured = true;
    this.logger.log('Cloudinary successfully configured');
  }
  //============================================================================
  // Combine all chunks into one file in correct order
  private async reassembleFile(
    uploadId: string,
    totalChunks: number,
    fileName: string,
  ): Promise<string> {
    const chunkDir = path.join(this.tempDir, uploadId);
    const fullFilePath = path.join(chunkDir, fileName);
    const writeStream = fs.createWriteStream(fullFilePath);

    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(chunkDir, i.toString());
      const readStream = fs.createReadStream(chunkPath);
      await pipeline(readStream, writeStream, { end: false });
    }

    writeStream.end();
    return fullFilePath;
  }
  //============================================================================
  // Upload a local file to Cloudinary using upload_stream
  private async uploadFileFromPath( filePath: string,): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return new Error('upload is fail')
          resolve(result);
        },
      );

      fs.createReadStream(filePath).pipe(uploadStream);
    });
  }
  //============================================================================
  // Remove temporary chunk files and folder for an upload session
  private async cleanup(uploadId: string): Promise<void> {
    try {
      const chunkDir = path.join(this.tempDir, uploadId);

      if (fs.existsSync(chunkDir)) {
        const files = await readdirAsync(chunkDir);
        await Promise.all(
          files.map((file) => unlinkAsync(path.join(chunkDir, file))),
        );
        await rmdirAsync(chunkDir);
      }

      this.uploadProgress.delete(uploadId);
    } catch (err) {
      this.logger.error('Cleanup error:', err);
    }
  }
  //============================================================================
  // Directory path to temporarily store uploaded files before processing
  private readonly tempDir = path.join(process.cwd(), 'tempUploads');
  //============================================================================
  // Track upload progress for chunked uploads using a map of uploadId to chunk info
  private uploadProgress = new Map<string,{ totalChunks: number; receivedChunks: number }>();
  //============================================================================
  // Upload a single chunk of a file (chunked upload)
  async uploadChunkedFile(
  chunk: Express.Multer.File,
  fileName: string,
  chunkNumber: number,
  totalChunks: number,
  uploadId: string,
): Promise<CloudinaryResponse | { done: boolean; received: number }> {
  const chunkDir = path.join(this.tempDir, uploadId);
  const chunkPath = path.join(chunkDir, chunkNumber.toString());

  try {
    if (!fs.existsSync(chunkDir)) {
      await mkdirAsync(chunkDir, { recursive: true });
    }

    await writeFileAsync(chunkPath, chunk.buffer);

    if (!this.uploadProgress.has(uploadId)) {
      this.uploadProgress.set(uploadId, { totalChunks, receivedChunks: 0 });
    }

    const progress = this.uploadProgress.get(uploadId);
    if (!progress) throw new Error('upload is fail')
    progress.receivedChunks++;

    if (progress.receivedChunks === totalChunks) {
      const fullFilePath = await this.reassembleFile(uploadId, totalChunks, fileName);
      const result = await this.uploadFileFromPath(fullFilePath);
      this.uploadProgress.delete(uploadId);
      await this.cleanup(uploadId);
      return result;
    }

    return { done: false, received: progress.receivedChunks };

  } catch (error) {
    await this.cleanup(uploadId);
    throw error;
  }
  }
  //============================================================================
  // Upload a single file directly (non-chunked)
  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null);

      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return new Error('upload is fail')
          resolve(result);
        },
      );

      bufferStream.pipe(uploadStream);
    });
  }
  //============================================================================
  // Cancel ongoing upload session and cleanup chunks
  async cancelUpload(
    uploadId: string,
  ): Promise<{ cancelled: boolean; message: string }> {
    const chunkDir = path.join(this.tempDir, uploadId);

    if (fs.existsSync(chunkDir)) {
      await this.cleanup(uploadId);
      return {
        cancelled: true,
        message: `Upload ${uploadId} canceled and cleaned up.`,
      };
    }

    return {
      cancelled: false,
      message: `No upload found with ID ${uploadId}.`,
    };
  }
  //============================================================================
  // Deletes a file from Cloudinary by public ID and resource type (default to 'video')
  async deleteFile(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'video',
    lang: 'en' | 'ar' = 'en',
  ): Promise<{ message: string; publicId: string }> {
    if (!this.isConfigured) {
      this.configureCloudinary();
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,
        {
          resource_type: resourceType,
          invalidate: true,
        },
        (error, result) => {
          if (error) {
            const errorMessage =
              lang === 'ar'
                ?` فشل حذف الملف من Cloudinary: ${error.message}`
                : `Failed to delete the file from Cloudinary: ${error.message}`;

            this.logger.error(`[CloudinaryService]  ${errorMessage}`);
            reject(new Error(errorMessage));
          } else {
            const successMessage =
              lang === 'ar'
                ?` تم حذف الملف بنجاح من Cloudinary`
                : `File was successfully deleted from Cloudinary`;

            this.logger.log(`[CloudinaryService]  ${successMessage} - ID: ${publicId}`);

            resolve({
              message: successMessage,
              publicId,
            });
          }
        },
      );
    });
  }
  //============================================================================
}
