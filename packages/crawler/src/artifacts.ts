export interface ScreenshotRef {
  page: string;
  viewport: string;
  url: string;
  r2Key: string;
  width: number;
  height: number;
}

export interface RecordingRef {
  page: string;
  url: string;
  r2Key: string;
  duration: number;
}

export async function uploadToR2(filePath: string, key: string, contentType?: string): Promise<string | null> {
  return null;
}

export async function uploadBufferToR2(buffer: Buffer, key: string, contentType?: string): Promise<string | null> {
  return null;
}

export async function getSignedUploadUrl(key: string, contentType: string): Promise<string | null> {
  return null;
}

export async function deleteFromR2(key: string): Promise<void> {}

export function getPublicUrl(key: string): string {
  return '';
}