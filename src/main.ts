import { HuffmanCompression } from "./algorithms/huffman/huffmanCompression";
import { FileCompressor } from "./services/fileCompressor";
import * as path from "path";

// Function to compress a file
export async function compressFile(
  filePath: string,
  outputDirectory: string
): Promise<string> {
  // Create compressor instance
  const compressor = new HuffmanCompression();

  // Create file compressor service
  const fileCompressor = new FileCompressor(compressor);

  // Compress the file
  return await fileCompressor.compressFile(filePath, outputDirectory);
}

// Function to decompress a file
export async function decompressFile(
  filePath: string,
  outputDirectory: string
): Promise<string> {
  // Create compressor instance
  const compressor = new HuffmanCompression();

  // Create file compressor service
  const fileCompressor = new FileCompressor(compressor);

  // Decompress the file
  return await fileCompressor.decompressFile(filePath, outputDirectory);
}

// Example usage
if (require.main === module) {
  // Example command line usage
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log("Usage:");
    console.log(
      "  Compress: node main.js compress <inputFilePath> <outputDirectory>"
    );
    console.log(
      "  Decompress: node main.js decompress <inputFilePath> <outputDirectory>"
    );
    process.exit(1);
  }

  const command = args[0];
  const inputPath = args[1];
  const outputDir = args[2];

  (async () => {
    try {
      if (command === "compress") {
        await compressFile(inputPath, outputDir);
        console.log("Compression completed successfully.");
      } else if (command === "decompress") {
        await decompressFile(inputPath, outputDir);
        console.log("Decompression completed successfully.");
      } else {
        console.error(`Unknown command: ${command}`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error:", err.message);
      } else {
        console.error("Error:", err);
      }
    }
  })();
}
