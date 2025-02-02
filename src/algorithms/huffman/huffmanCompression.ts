import { ICompressor } from "../../core/interfaces/iCompressor";
import { HuffmanNode } from "./huffmanNode";

export class HuffmanCompression implements ICompressor {
   compress(data: Buffer): Promise<Buffer> {
    return Promise.resolve(Buffer.from([]));
  }
   decompress(data: Buffer): Promise<Buffer> {
    return Promise.resolve(Buffer.from([]));
  }
   getCompressionRatio(): number {
    return 10;
  }
   getCompressionType(): string {
    return "";
  }
}
