export interface ICompressor {
    // Main compression methods
  compress(data: Buffer): Promise<Buffer>;
    decompress(data: Buffer): Promise<Buffer>;

    // Utility methods
    getCompressionRatio(): number;
    getCompressionType(): string;
    
    // Optional configuration methods
    setCompressionLevel?(level: number): void;
    getMetadata?(): Record<string, any>;
}