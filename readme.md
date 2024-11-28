# Embedding Text within PNG image

This is a basic implementation to hide a message inside a PNG image using steganography. The text is encoded into the image's pixels without visibly changing it.

The `encode` function hides a secret message inside an image by slightly changing the color values of its pixels in a way that’s invisible to the human eye.

How it works:

1. The message is converted into a binary format (a sequence of 0s and 1s).
2. Each pixel's color in the image (red, green, blue) is represented by a number (0–255). The program replaces the Least Significant Bit (LSB) of each color channel (RGB) with a bit from the message.
3. These tiny modifications are invisible to the naked eye but encode the message within the image.

## Usage

#### Encoding

1. Provide the path to the input PNG image.
2. Specify the message you want to hide.
3. Function saves the modified image with the hidden message.

#### Decoding

1. Provide the path to the image containing the hidden message.
2. The function extracts and displays the hidden message.

## Example

```js
const inputPath = 'image.png'; // Path to the input image
const outputPath = 'image_with_message.png'; // Path to save the output image
const message = 'Ninja mission objective!'; // The hidden message

// Encode the message
await encode(inputPath, outputPath, message);

// Decode the message
const decodedMessage = await decode(outputPath);
console.log(decodedMessage); // Output: Ninja mission objective!
```

## Recommendations for Production Use

### 1. Compression

Use compression algorithms to minimize the size of the embedded data. This is especially useful when duplicating data across multiple locations in the image.

### 2. Non-sequential embedding

Use a pseudo-random sequence, based on a passphrase for example, to determine which pixels to modify. This makes the embedding process harder to detect.

### 3. Data encryption

Encrypt the message before embedding it into the image using algorithms like AES to add a layer of security.

### 4. Error-Correction

Implement redundancy or error-correction techniques (Hamming codes, Reed-Solomon codes). This ensures the message can be recovered even if the image is slightly resized or compressed.

### 5. Hybrid Approach

Combine pixel-based embedding with frequency-domain techniques like DCT (Discrete Cosine Transform) or wavelets to enhance robustness, ensuring the message remains intact and harder to detect even if the image is altered.

### 6. Go crazy with LLM

Train a small CNN (Convolutional Neural Network) model to recognize specific pixel patterns or distributions randomly embedded in the image.
