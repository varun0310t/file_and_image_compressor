File Compression Tool Documentation

This documentation provides an overview of the file compression tool implemented in src/main.ts. This tool allows users to compress and decompress files using Huffman coding, a popular compression algorithm.

Overview

The code file contains functions that enable file compression and decompression. It utilizes the HuffmanCompression class from the Huffman algorithm module and the FileCompressor service to facilitate the compression process.

Functions

compressFile(filePath: string, outputDirectory: string): Promise

This asynchronous function compresses a file located at filePath and saves the compressed file to the specified outputDirectory.

Parameters:





filePath (string): The path to the input file that needs to be compressed.



outputDirectory (string): The directory where the compressed file will be stored.

Returns:

A promise that resolves to a string indicating the path of the compressed file.

Example:


await compressFile("path/to/input.txt", "path/to/output");
                

decompressFile(filePath: string, outputDirectory: string): Promise

This asynchronous function decompresses a file located at filePath and saves the decompressed file to the specified outputDirectory.

Parameters:





filePath (string): The path to the input file that needs to be decompressed.



outputDirectory (string): The directory where the decompressed file will be stored.

Returns:

A promise that resolves to a string indicating the path of the decompressed file.

Example:


await decompressFile("path/to/compressed.huff", "path/to/output");
                

Example Usage

The tool can be run from the command line. Here’s how you can use it:


node main.js compress  
node main.js decompress  
            

Make sure to replace <inputFilePath> and <outputDirectory> with the actual paths you wish to use.

Error Handling

The code includes basic error handling to catch and display any errors that occur during the compression or decompression processes. If an unknown command is entered, an error message will be displayed.