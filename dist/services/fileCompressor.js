"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileCompressor = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const bitUtils_1 = require("../utils/bitUtils");
class FileCompressor {
    constructor(compressor) {
        this.chunkSize = 1024 * 1024 * 10; // 10 MB chunk size for large files
        this.validateChecksum = true;
        this.compressor = compressor;
    }
    compressFile(filePath, outputDirectory) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const compressedData = yield this.compressor.compress(fileData);
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
                console.log(`Space saving: ${((1 - 1 / compressionRatio) * 100).toFixed(2)}%`);
                console.log(`Time taken: ${(endTime - startTime) / 1000} seconds`);
                if (this.validateChecksum) {
                    console.log(`Compressed checksum: ${compressedChecksum}`);
                }
                if (this.compressor.getMetadata) {
                    const metadata = this.compressor.getMetadata();
                    console.log("\nMetadata:", metadata);
                }
                return outputPath;
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error(`Error compressing file: ${error.message}`);
                    console.error(error.stack);
                }
                else {
                    console.error(`Error compressing file: ${error}`);
                }
                throw error;
            }
        });
    }
    decompressFile(filePath, outputDirectory) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const { isValid, errors } = bitUtils_1.BitUtils.validateCompressedData(compressedData);
                if (!isValid) {
                    throw new Error(`Invalid compressed file format: ${errors.join(', ')}`);
                }
                // Decompress data
                console.log("Decompressing data...");
                const startTime = Date.now();
                const decompressedData = yield this.compressor.decompress(compressedData);
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
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error(`Error decompressing file: ${error.message}`);
                    console.error(error.stack);
                }
                else {
                    console.error(`Error decompressing file: ${error}`);
                }
                throw error;
            }
        });
    }
    // Calculate MD5 checksum of a file
    calculateFileChecksum(filePath) {
        const fileBuffer = fs.readFileSync(filePath);
        const hashSum = crypto.createHash('md5');
        hashSum.update(fileBuffer);
        return hashSum.digest('hex');
    }
    // Set chunk size for processing large files
    setChunkSize(sizeInMB) {
        this.chunkSize = sizeInMB * 1024 * 1024;
    }
    // Enable/disable checksum validation
    setChecksumValidation(enable) {
        this.validateChecksum = enable;
    }
}
exports.FileCompressor = FileCompressor;
