import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { S3_EVENT_BUCKET } from 'src/common/constants/s3-buckets.constant';

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

  async uploadEventPoster(
    fileName: string,
    body: Buffer | Readable,
    mimetype: string,
  ) {
    const bucket = S3_EVENT_BUCKET;
    const key = `images/${uuidv4()}-${fileName}`;

    this.uploadFile(bucket, key, body, mimetype);

    const url = `${this.appUrl}/${bucket}/${key}`;

    return url;
  }


  async uploadFile(
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
    return this.s3Client.send(command);
  }
}