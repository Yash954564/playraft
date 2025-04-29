import { logger } from '../../utils/logger';
import { configReader } from '../../utils/configReader';
import * as fs from 'fs';
import * as path from 'path';

/**
 * AWS S3 Service for storing test artifacts
 */
export class S3Service {
  private s3Client: any;
  private bucket: string;
  private region: string;
  private isConfigured: boolean = false;

  /**
   * Constructor
   */
  constructor() {
    try {
      // Try to import AWS SDK
      const AWS = require('aws-sdk');
      
      // Get AWS configuration from environment variables or config
      this.region = process.env.AWS_REGION || configReader.getValue<string>('integrations.aws.region', 'us-east-1');
      this.bucket = process.env.AWS_S3_BUCKET || configReader.getValue<string>('integrations.aws.s3.bucket', '');
      const accessKeyId = process.env.AWS_ACCESS_KEY_ID || configReader.getValue<string>('integrations.aws.accessKeyId', '');
      const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || configReader.getValue<string>('integrations.aws.secretAccessKey', '');
      
      // Check if AWS is configured
      this.isConfigured = !!(this.bucket && accessKeyId && secretAccessKey);
      
      if (this.isConfigured) {
        // Configure AWS SDK
        AWS.config.update({
          region: this.region,
          accessKeyId,
          secretAccessKey
        });
        
        // Create S3 client
        this.s3Client = new AWS.S3();
        
        logger.info('AWS S3 integration initialized successfully');
      } else {
        logger.warn('AWS S3 integration not configured. Some features may not work.');
      }
    } catch (error) {
      logger.error(`Error initializing AWS S3 integration: ${error}`);
      this.isConfigured = false;
    }
  }

  /**
   * Upload file to S3
   * @param filePath Local file path
   * @param s3Key S3 key (path in bucket)
   * @param contentType Content type (MIME type)
   * @returns S3 URL or null if upload failed
   */
  async uploadFile(
    filePath: string,
    s3Key?: string,
    contentType?: string
  ): Promise<string | null> {
    if (!this.isConfigured) {
      logger.error('AWS S3 integration not configured. Cannot upload file.');
      return null;
    }
    
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        logger.error(`File not found: ${filePath}`);
        return null;
      }
      
      // If S3 key not provided, use file name
      if (!s3Key) {
        s3Key = path.basename(filePath);
      }
      
      // If content type not provided, try to guess from file extension
      if (!contentType) {
        const extension = path.extname(filePath).toLowerCase();
        contentType = this.getContentType(extension);
      }
      
      // Read file
      const fileContent = fs.readFileSync(filePath);
      
      // Upload parameters
      const params = {
        Bucket: this.bucket,
        Key: s3Key,
        Body: fileContent,
        ContentType: contentType
      };
      
      // Upload file
      await this.s3Client.upload(params).promise();
      
      // Get S3 URL
      const s3Url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${s3Key}`;
      
      logger.info(`File uploaded to S3: ${s3Url}`);
      
      return s3Url;
    } catch (error) {
      logger.error(`Error uploading file to S3: ${error}`);
      return null;
    }
  }

  /**
   * Upload test evidence to S3
   * @param testName Test name
   * @param evidenceType Evidence type (screenshots, videos, logs)
   * @param filePath Local file path
   * @returns S3 URL or null if upload failed
   */
  async uploadTestEvidence(
    testName: string,
    evidenceType: 'screenshots' | 'videos' | 'logs',
    filePath: string
  ): Promise<string | null> {
    // Replace spaces and special characters in test name
    const sanitizedTestName = testName.replace(/[^a-zA-Z0-9]/g, '_');
    
    // Generate S3 key
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const fileName = path.basename(filePath);
    const s3Key = `test-evidence/${sanitizedTestName}/${evidenceType}/${timestamp}_${fileName}`;
    
    // Upload file
    return await this.uploadFile(filePath, s3Key);
  }

  /**
   * Upload test report to S3
   * @param reportPath Local report path
   * @param reportName Report name
   * @returns S3 URL or null if upload failed
   */
  async uploadTestReport(
    reportPath: string,
    reportName: string
  ): Promise<string | null> {
    // Generate S3 key
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const s3Key = `test-reports/${reportName}/${timestamp}`;
    
    // Upload file
    return await this.uploadFile(reportPath, s3Key, 'application/zip');
  }

  /**
   * List files in S3 bucket
   * @param prefix Prefix (folder path)
   * @returns Array of S3 objects or null if listing failed
   */
  async listFiles(prefix: string): Promise<any[] | null> {
    if (!this.isConfigured) {
      logger.error('AWS S3 integration not configured. Cannot list files.');
      return null;
    }
    
    try {
      // List parameters
      const params = {
        Bucket: this.bucket,
        Prefix: prefix
      };
      
      // List objects
      const response = await this.s3Client.listObjectsV2(params).promise();
      
      logger.info(`Listed ${response.Contents.length} files in S3 bucket with prefix: ${prefix}`);
      
      return response.Contents;
    } catch (error) {
      logger.error(`Error listing files in S3: ${error}`);
      return null;
    }
  }

  /**
   * Download file from S3
   * @param s3Key S3 key (path in bucket)
   * @param localPath Local file path
   * @returns True if download succeeded, false otherwise
   */
  async downloadFile(s3Key: string, localPath: string): Promise<boolean> {
    if (!this.isConfigured) {
      logger.error('AWS S3 integration not configured. Cannot download file.');
      return false;
    }
    
    try {
      // Download parameters
      const params = {
        Bucket: this.bucket,
        Key: s3Key
      };
      
      // Get object
      const response = await this.s3Client.getObject(params).promise();
      
      // Create directory if it doesn't exist
      const directory = path.dirname(localPath);
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
      
      // Write file
      fs.writeFileSync(localPath, response.Body);
      
      logger.info(`File downloaded from S3: ${s3Key} to ${localPath}`);
      
      return true;
    } catch (error) {
      logger.error(`Error downloading file from S3: ${error}`);
      return false;
    }
  }

  /**
   * Delete file from S3
   * @param s3Key S3 key (path in bucket)
   * @returns True if deletion succeeded, false otherwise
   */
  async deleteFile(s3Key: string): Promise<boolean> {
    if (!this.isConfigured) {
      logger.error('AWS S3 integration not configured. Cannot delete file.');
      return false;
    }
    
    try {
      // Delete parameters
      const params = {
        Bucket: this.bucket,
        Key: s3Key
      };
      
      // Delete object
      await this.s3Client.deleteObject(params).promise();
      
      logger.info(`File deleted from S3: ${s3Key}`);
      
      return true;
    } catch (error) {
      logger.error(`Error deleting file from S3: ${error}`);
      return false;
    }
  }

  /**
   * Get pre-signed URL for S3 object
   * @param s3Key S3 key (path in bucket)
   * @param expiresIn Expiration time in seconds (default: 3600 = 1 hour)
   * @returns Pre-signed URL or null if generation failed
   */
  getPreSignedUrl(s3Key: string, expiresIn: number = 3600): string | null {
    if (!this.isConfigured) {
      logger.error('AWS S3 integration not configured. Cannot generate pre-signed URL.');
      return null;
    }
    
    try {
      // URL parameters
      const params = {
        Bucket: this.bucket,
        Key: s3Key,
        Expires: expiresIn
      };
      
      // Generate URL
      const url = this.s3Client.getSignedUrl('getObject', params);
      
      logger.info(`Generated pre-signed URL for ${s3Key} (expires in ${expiresIn} seconds)`);
      
      return url;
    } catch (error) {
      logger.error(`Error generating pre-signed URL: ${error}`);
      return null;
    }
  }

  /**
   * Get content type based on file extension
   * @param extension File extension
   * @returns Content type
   */
  private getContentType(extension: string): string {
    // Common content types
    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.mp4': 'video/mp4',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.txt': 'text/plain',
      '.log': 'text/plain',
      '.html': 'text/html',
      '.htm': 'text/html',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.pdf': 'application/pdf',
      '.zip': 'application/zip',
      '.gz': 'application/gzip'
    };
    
    return contentTypes[extension] || 'application/octet-stream';
  }
}

// Export singleton instance
export const s3Service = new S3Service();