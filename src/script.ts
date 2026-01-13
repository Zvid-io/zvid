import path from 'path';
import os from 'os';

const platform = os.platform();
import input from '../input.json';
import renderVideo from './index';
import { Project } from './types/items.type';
import ffmpeg from 'fluent-ffmpeg';
import PuppeteerManager from './utils/puppeteerManager';
import fs from 'fs';
import {
  ErrorHandler,
  getErrorDetails,
  getUserSafeErrorInfo,
  isVideoRenderError,
} from './errors';

const outputPath = path.join(__dirname, '../output');

renderVideo(input as any, outputPath, (percentage: number) => {
  console.log(`Progress: ${percentage}%`);
})
  .then(async () => {
    const puppeteerManager = PuppeteerManager.getInstance();
    await puppeteerManager.closeBrowser();
    console.log('Video rendering completed successfully!');
    process.exit(0);
  })
  .catch(async (err) => {
    const puppeteerManager = PuppeteerManager.getInstance();
    await puppeteerManager.closeBrowser();

    // Handle errors with our new error system
    const wrappedError = ErrorHandler.wrapError(err);

    // Log detailed error information for debugging
    console.error('=== VIDEO RENDERING FAILED ===');
    console.error(
      'Error Details:',
      JSON.stringify(getErrorDetails(wrappedError), null, 2)
    );

    // Show user-friendly error information
    const userInfo = getUserSafeErrorInfo(wrappedError);
    console.error('\nUser-Friendly Error Info:');
    console.error(`Message: ${userInfo.message}`);
    console.error(`Code: ${userInfo.code || 'N/A'}`);
    console.error(
      `Suggestion: ${userInfo.suggestion || 'No suggestion available'}`
    );

    if (userInfo.docsUrl) {
      console.error(`Documentation: ${userInfo.docsUrl}`);
    }

    if (isVideoRenderError(wrappedError)) {
      console.error(`Severity: ${wrappedError.getSeverity()}`);
      console.error(`Recoverable: ${wrappedError.isRecoverable()}`);
    }

    process.exit(1);
  });
