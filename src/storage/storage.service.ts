import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly appUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.appUrl = this.configService.getOrThrow('APP_BASE_URL');

    this.s3Client = new S3Client({
      region: this.configService.getOrThrow('S3_REGION'),
      endpoint: this.configService.getOrThrow('S3_URL'),
      credentials: {
        accessKeyId: this.configService.getOrThrow('S3_ACCESS_KEY'),
        secretAccessKey: this.configService.getOrThrow('S3_SECRET_KEY'),
      },
      forcePathStyle: this.configService.get<boolean>('S3_FORCE_PATH'),
    });
  }

  async uploadFileInBucket(
    bucket: string,
    fileName: string,
    body: Buffer | Readable,
    mimetype: string,
  ) {
    const key = `images/${uuidv4()}-${fileName}`;

    this.upload(bucket, key, body, mimetype);

    const url = `${this.appUrl}/${bucket}/${key}`;

    return url;
  }


  async deleteFileInBucket(bucket: string, url: string) {
    const key = this.extractKeyFromUrl(url);

    await this.delete(bucket, key);
  }


  private async delete(bucket: string, key: string) {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete old file');
    }
  }


  private async upload(
    bucket: string,
    key: string,
    body: Buffer | Readable,
    mimetype: string,
  ) {
    const params: PutObjectCommandInput = {
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: mimetype,
    };

    const command = new PutObjectCommand(params);

    try {
      return await this.s3Client.send(command);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to upload file to storage',
      );
    }
  }


  extractKeyFromUrl(url: string): string {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    const parts = pathname.split('/');
    parts.shift();
    parts.shift();

    return parts.join('/');
  }
}