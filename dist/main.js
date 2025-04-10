"use strict";
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
exports.compressFile = compressFile;
exports.decompressFile = decompressFile;
const huffmanCompression_1 = require("./algorithms/huffman/huffmanCompression");
const fileCompressor_1 = require("./services/fileCompressor");
// Function to compress a file
function compressFile(filePath, outputDirectory) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create compressor instance
        const compressor = new huffmanCompression_1.HuffmanCompression();
        // Create file compressor service
        const fileCompressor = new fileCompressor_1.FileCompressor(compressor);
        // Compress the file
        return yield fileCompressor.compressFile(filePath, outputDirectory);
    });
}
// Function to decompress a file
function decompressFile(filePath, outputDirectory) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create compressor instance
        const compressor = new huffmanCompression_1.HuffmanCompression();
        // Create file compressor service
        const fileCompressor = new fileCompressor_1.FileCompressor(compressor);
        // Decompress the file
        return yield fileCompressor.decompressFile(filePath, outputDirectory);
    });
}
// Example usage
if (require.main === module) {
    // Example command line usage
    const args = process.argv.slice(2);
    if (args.length < 3) {
        console.log("Usage:");
        console.log("  Compress: node main.js compress <inputFilePath> <outputDirectory>");
        console.log("  Decompress: node main.js decompress <inputFilePath> <outputDirectory>");
        process.exit(1);
    }
    const command = args[0];
    const inputPath = args[1];
    const outputDir = args[2];
    (() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (command === "compress") {
                yield compressFile(inputPath, outputDir);
                console.log("Compression completed successfully.");
            }
            else if (command === "decompress") {
                yield decompressFile(inputPath, outputDir);
                console.log("Decompression completed successfully.");
            }
            else {
                console.error(`Unknown command: ${command}`);
            }
        }
        catch (err) {
            if (err instanceof Error) {
                console.error("Error:", err.message);
            }
            else {
                console.error("Error:", err);
            }
        }
    }))();
}
