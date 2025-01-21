# file_and_image_compressor

# current plan for file structure 

file_and_image_compressor/
├── src/
│   ├── main.ts                    # Entry point
│   ├── algorithms/
│   │   ├── huffman/
│   │   │   ├── HuffmanNode.ts
│   │   │   ├── HuffmanTree.ts
│   │   │   └── HuffmanCompression.ts
│   │   ├── lzw/
│   │   │   ├── Dictionary.ts
│   │   │   └── LZWCompression.ts
│   │   └── rle/
│   │       └── RLECompression.ts
│   ├── core/
│   │   ├── CompressorFactory.ts
│   │   ├── FileHandler.ts
│   │   └── interfaces/
│   │       ├── ICompressor.ts
│   │       └── INode.ts
│   └── utils/
│       ├── BufferUtils.ts
│       ├── FileUtils.ts
│       └── ValidationUtils.ts
├── tests/
│   ├── huffman.test.ts
│   ├── lzw.test.ts
│   └── rle.test.ts
├── dist/
├── tsconfig.json
└── package.json