import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { readFileSync, existsSync } from 'fs';
import { basename } from 'path';

let s3Client: S3Client | null = null;

export function getR2Client(): S3Client | null {
  if (s3Client) return s3Client;

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null;
  }

  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return s3Client;
}

export async function uploadToR2(
  filePath: string,
  key: string,
  contentType: string = 'application/octet-stream'
): Promise<string | null> {
  const client = getR2Client();
  if (!client) return null;

  const bucket = process.env.R2_BUCKET || 'clipcode';
  const fileContent = readFileSync(filePath);

  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
  }));

  return `https://${bucket}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
}

export async function uploadBufferToR2(
  buffer: Buffer,
  key: string,
  contentType: string = 'application/octet-stream'
): Promise<string | null> {
  const client = getR2Client();
  if (!client) return null;

  const bucket = process.env.R2_BUCKET || 'clipcode';

  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));

  return `https://${bucket}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
}

export async function getSignedUploadUrl(key: string, contentType: string): Promise<string | null> {
  const client = getR2Client();
  if (!client) return null;

  const bucket = process.env.R2_BUCKET || 'clipcode';
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(client, command, { expiresIn: 3600 });
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client();
  if (!client) return;

  const bucket = process.env.R2_BUCKET || 'clipcode';
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export function getPublicUrl(key: string): string {
  const accountId = process.env.R2_ACCOUNT_ID;
  const bucket = process.env.R2_BUCKET || 'clipcode';
  return `https://${bucket}.${accountId}.r2.cloudflarestorage.com/${key}`;
}