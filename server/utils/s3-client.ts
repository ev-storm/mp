import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

interface S3Config {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

/**
 * Создает S3 клиент для Yandex Object Storage
 */
export function createS3Client(config: S3Config): S3Client {
  return new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: false,
  });
}

/**
 * Загружает файл в Yandex Object Storage
 */
export async function uploadToS3(
  client: S3Client,
  bucket: string,
  key: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    ACL: "public-read",
  });

  await client.send(command);
}

/**
 * Удаляет файл из Yandex Object Storage
 */
export async function deleteFromS3(
  client: S3Client,
  bucket: string,
  key: string
): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await client.send(command);
}

/**
 * Формирует публичный URL для файла в Yandex Object Storage
 */
export function getPublicUrl(bucket: string, key: string): string {
  return `https://${bucket}.storage.yandexcloud.net/${key}`;
}

