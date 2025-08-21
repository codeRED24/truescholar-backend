import { Injectable } from "@nestjs/common";
import { S3 } from "aws-sdk";
import { File } from "@nest-lab/fastify-multer";

@Injectable()
export class FileUploadService {
  private s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

  async uploadFile(
    file: File,
    folder: string,
    extraName?: number
  ): Promise<string> {
    // sanitize original name: replace whitespace with '-' and remove path segments
    const safeOriginalName = file.originalname
      .replace(/\s+/g, "-")
      .split("/")
      .pop();
    const fileName = extraName
      ? `${Date.now()}-${extraName}-${safeOriginalName}`
      : `${Date.now()}-${safeOriginalName}`;
    const filePath = `${folder}/${fileName}`;
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: filePath,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    const uploadResult = await this.s3.upload(params).promise();
    return uploadResult.Location;
  }

  async deleteFileByPath(filePath: string): Promise<void> {
    const Key = filePath
      .replace(
        /^https:\/\/s3\.ap-south-1\.amazonaws\.com\/kapp-assets-store2.0\//,
        ""
      )
      .replace(/^\//, ""); // Ensure no leading slash

    try {
      // Check if the file exists
      await this.s3
        .headObject({ Bucket: process.env.AWS_S3_BUCKET_NAME, Key })
        .promise();
      // Deleting file
      await this.s3
        .deleteObject({ Bucket: process.env.AWS_S3_BUCKET_NAME, Key })
        .promise();
    } catch (error) {
      console.log("Error deleting file:", error);
    }
  }
}
