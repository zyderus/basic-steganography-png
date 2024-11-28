import * as fs from 'fs/promises';
import { PNG } from 'pngjs';

function writeMessage(imageBinary, dataBinary) {
  let dataBitIndex = 0; // Keeps track of which bit of the data we're currently writing

  // Loop through the image binary data in chunks of 4 (RGBA values per pixel)
  for (let i = 0; i < imageBinary.length; i += 4) {
    // If we've already written all the data, exit the loop
    if (dataBitIndex >= dataBinary.length * 8) {
      break;
    }

    // Loop through each of the RGB channels in the current pixel (ignoring alpha)
    for (let channel = 0; channel < 3; channel++) {
      // If we still have data to write, get the next bit from the data
      if (dataBitIndex < dataBinary.length * 8) {
        const currentByte = dataBinary[Math.floor(dataBitIndex / 8)];
        const bitPosition = 7 - (dataBitIndex % 8);
        const bit = (currentByte >> bitPosition) & 1;

        // Modify the current color channel by setting the least significant bit
        imageBinary[i + channel] = (imageBinary[i + channel] & 0xfe) | bit;

        // Move to the next bit in the data
        dataBitIndex++;
      }
    }
  }

  // Return the modified image binary data
  return imageBinary;
}

async function encode(inputPath, outputPath, message) {
  const binaryMessage = Buffer.from(message, 'utf-8');

  // Read the image file and parse it using PNG
  const inputBuffer = await fs.readFile(inputPath);
  const png = PNG.sync.read(inputBuffer); // Sync version of PNG parsing

  // Prepare the message data with its length
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(binaryMessage.length, 0);
  const binaryTotalData = Buffer.concat([lengthBuffer, binaryMessage]);

  writeMessage(png.data, binaryTotalData); // Embed the message into the image binary

  // Write the modified PNG back to a file
  const outputBuffer = PNG.sync.write(png); // Sync method to write the modified image
  await fs.writeFile(outputPath, outputBuffer); // Save the output image

  console.log('Message successfully encoded into the image!');
}

function readMessage(dataBinary) {
  let messageBytes = []; // To store the decoded message as bytes
  let currentByte = 0; // Holds the current byte being constructed
  let dataBitIndex = 0; // Keeps track of which bit of the data we're reading

  // Loop through the image binary data in chunks of 4 (RGBA values per pixel)
  for (let i = 0; i < dataBinary.length; i += 4) {
    // Loop through the RGB channels of the current pixel (ignoring alpha)
    for (let channel = 0; channel < 3; channel++) {
      // Extract the least significant bit (LSB) from the current color channel
      const bit = dataBinary[i + channel] & 1;

      // Shift the current byte left to make space for the new bit
      currentByte = (currentByte << 1) | bit;

      // Move to the next bit in the data
      dataBitIndex++;

      // Once we've gathered 8 bits (1 byte), add it to the messageBytes array
      if (dataBitIndex % 8 === 0) {
        messageBytes.push(currentByte);
        currentByte = 0; // Reset currentByte for the next byte
      }
    }
  }

  // Convert the array of bytes back into a Buffer representing the message
  return Buffer.from(messageBytes);
}

async function decode(targetPath) {
  try {
    // Read the image file asynchronously
    const inputBuffer = await fs.readFile(targetPath); // Using fs.promises.readFile
    const png = PNG.sync.read(inputBuffer); // Sync version of PNG parsing

    // Read the hidden message from the image's pixel data
    const binaryTotalData = readMessage(png.data);

    // Retrieve the length of the message (first 4 bytes)
    const length = binaryTotalData.readUInt32BE();

    // Slice the binary data to extract the message
    const binaryMessage = binaryTotalData.slice(4, 4 + length);
    const decodedMessage = binaryMessage.toString('utf-8');

    return decodedMessage;
  } catch (err) {
    throw new Error('Error during decoding: ' + err.message); // Improved error handling
  }
}

const inputPath = 'img/cherry.png'; // Path to the input image
const outputPath = 'img/cherry-msg.png'; // Path to save the output image with the hidden message
const message = 'Ninja mission objective!'; // Message to encode

await encode(inputPath, outputPath, message);
const decodedMessage = await decode(outputPath);
console.log('Decoded message:', decodedMessage);
