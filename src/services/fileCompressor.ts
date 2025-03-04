import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { ICompressor } from "../core/interfaces/iCompressor";
import { BitUtils } from "../utils/bitUtils";

export class FileCompressor {
  private compressor: ICompressor;
  private chunkSize: number = 1024 * 1024 * 10; // 10 MB chunk size for large files
  private validateChecksum: boolean = true;

  constructor(compressor: ICompressor) {
    this.compressor = compressor;
  }

  async compressFile(filePath: string, outputDirectory: string): Promise<string> {
    try {
      // Validate input file
      if (!fs.existsSync(filePath)) {
        throw new Error(`Input file not found: ${filePath}`);
      }

      // Get file stats for size check
      const stats = fs.statSync(filePath);
      
      // Ensure output directory exists
      if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
      }

      // Get filename and create output path
      const fileName = path.basename(filePath);
      const outputPath = path.join(outputDirectory, `${fileName}.compressed`);

      // Log start of operation
      console.log(`Starting compression of: ${filePath} (${stats.size} bytes)`);
      
      // Calculate file checksum for verification
      const fileChecksum = this.validateChecksum 
        ? this.calculateFileChecksum(filePath) 
        : null;
      
      if (this.validateChecksum) {
        console.log(`File checksum: ${fileChecksum}`);
      }
      
      // Process the file
      console.log("Reading file data...");
      const fileData = fs.readFileSync(filePath);
      
      // Compress data
      console.log("Compressing data...");
      const startTime = Date.now();
      const compressedData = await this.compressor.compress(fileData);
      const endTime = Date.now();
      
      // Write compressed file
      fs.writeFileSync(outputPath, compressedData);

      // Calculate compressed checksum
      const compressedChecksum = this.validateChecksum
        ? crypto.createHash('md5').update(compressedData).digest('hex')
        : null;

      // Log compression statistics
      const compressionRatio = this.compressor.getCompressionRatio();
      console.log(`\nCompression complete:`);
      console.log(`Input file: ${filePath}`);
      console.log(`Output file: ${outputPath}`);
      console.log(`Original size: ${fileData.length} bytes`);
      console.log(`Compressed size: ${compressedData.length} bytes`);
      console.log(`Compression ratio: ${compressionRatio.toFixed(2)}x`);
      console.log(`Space saving: ${((1 - 1/compressionRatio) * 100).toFixed(2)}%`);
      console.log(`Time taken: ${(endTime - startTime) / 1000} seconds`);
      
      if (this.validateChecksum) {
        console.log(`Compressed checksum: ${compressedChecksum}`);
      }
      
      if (this.compressor.getMetadata) {
        const metadata = this.compressor.getMetadata();
        console.log("\nMetadata:", metadata);
      }

      return outputPath;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error compressing file: ${error.message}`);
        console.error(error.stack);
      } else {
        console.error(`Error compressing file: ${error}`);
      }
      throw error;
    }
  }

  async decompressFile(filePath: string, outputDirectory: string): Promise<string> {
    try {
      // Validate input file
      if (!fs.existsSync(filePath)) {
        throw new Error(`Input file not found: ${filePath}`);
      }

      // Get file stats
      const stats = fs.statSync(filePath);
      
      // Ensure output directory exists
      if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
      }

      // Get original filename (remove .compressed extension)
      const fileName = path.basename(filePath, ".compressed");
      const outputPath = path.join(outputDirectory, fileName);

      // Log start of operation
      console.log(`Starting decompression of: ${filePath} (${stats.size} bytes)`);
      
      // Calculate compressed file checksum for verification
      const compressedChecksum = this.validateChecksum
        ? this.calculateFileChecksum(filePath)
        : null;
      
      if (this.validateChecksum) {
        console.log(`Compressed checksum: ${compressedChecksum}`);
      }
      
      // Read compressed file
      console.log("Reading compressed data...");
      const compressedData = fs.readFileSync(filePath);
      
      // Validate compressed data format
      const { isValid, errors } = BitUtils.validateCompressedData(compressedData);
      if (!isValid) {
        throw new Error(`Invalid compressed file format: ${errors.join(', ')}`);
      }

      // Decompress data
      console.log("Decompressing data...");
      const startTime = Date.now();
      const decompressedData = await this.compressor.decompress(compressedData);
      const endTime = Date.now();

      // Calculate decompressed checksum
      const decompressedChecksum = this.validateChecksum
        ? crypto.createHash('md5').update(decompressedData).digest('hex')
        : null;
      
      // Write decompressed file
      fs.writeFileSync(outputPath, decompressedData);

      // Log decompression statistics
      console.log(`\nDecompression complete:`);
      console.log(`Input file: ${filePath}`);
      console.log(`Output file: ${outputPath}`);
      console.log(`Compressed size: ${compressedData.length} bytes`);
      console.log(`Decompressed size: ${decompressedData.length} bytes`);
      console.log(`Time taken: ${(endTime - startTime) / 1000} seconds`);

      if (this.validateChecksum) {
        console.log(`Decompressed checksum: ${decompressedChecksum}`);
      }

      return outputPath;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error decompressing file: ${error.message}`);
        console.error(error.stack);
      } else {
        console.error(`Error decompressing file: ${error}`);
      }
      throw error;
    }
  }

  // Calculate MD5 checksum of a file
  private calculateFileChecksum(filePath: string): string {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('md5');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  }

  // Set chunk size for processing large files
  setChunkSize(sizeInMB: number): void {
    this.chunkSize = sizeInMB * 1024 * 1024;
  }
  
  // Enable/disable checksum validation
  setChecksumValidation(enable: boolean): void {
    this.validateChecksum = enable;
  }
}
