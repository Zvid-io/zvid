import puppeteer, { Browser, Page } from 'puppeteer';
import { mkdir, rm } from 'fs/promises';
import path from 'path';
import os from 'os';
import { RenderingError, ResourceError, ErrorHandler } from '../errors';
import configInstance from '../lib/config/config';

class PuppeteerManager {
  private static instance: PuppeteerManager | null = null;
  private browser: Browser | null = null;
  private tempDirectory: string | null = null;

  private constructor() {}

  static getInstance(): PuppeteerManager {
    if (!PuppeteerManager.instance) {
      PuppeteerManager.instance = new PuppeteerManager();
    }
    return PuppeteerManager.instance;
  }

  async initBrowser(): Promise<void> {
    if (!this.browser) {
      try {
        this.browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
      } catch (error) {
        throw RenderingError.puppeteerFailed(
          'browser initialization',
          undefined,
          error as Error
        );
      }
    }
  }

  async newPage(): Promise<Page> {
    try {
      !this.browser && (await this.initBrowser());
      const { width, height } = configInstance.getConfig();
      if (width && height) {
        const page = await this.browser!.newPage();
        await page.setViewport({ width, height });
        return page;
      } else {
        return await this.browser!.newPage();
      }
    } catch (error) {
      throw ErrorHandler.wrapError(error, 'newPage');
    }
  }

  /**
   * Start a new render session: new unique temp directory.
   * Call this once at the beginning of each renderVideo().
   */
  async startRenderSession(): Promise<string> {
    // Optional: cleanup any previous temp dir from last render
    if (this.tempDirectory) {
      try {
        await rm(this.tempDirectory, { recursive: true, force: true });
      } catch {
        // ignore cleanup errors
      }
      this.tempDirectory = null;
    }

    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.tempDirectory = path.join(
      os.tmpdir(),
      'video-rendering-package',
      uniqueId
    );

    try {
      await mkdir(this.tempDirectory, { recursive: true });
    } catch (error: any) {
      if (error.code === 'EACCES') {
        throw ResourceError.permissionDenied(
          this.tempDirectory,
          'create directory'
        );
      }
      throw ErrorHandler.wrapError(error, 'startRenderSession');
    }

    return this.tempDirectory;
  }

  /**
   * Get the current render session's temp directory.
   * If no session is started yet, lazily create one.
   */
  async getTempDirectory(): Promise<string> {
    if (!this.tempDirectory) {
      await this.startRenderSession();
    }
    return this.tempDirectory as string;
  }

  async cleanupTempDirectory(): Promise<void> {
    if (this.tempDirectory) {
      try {
        if (process.env.NODE_ENV === 'production')
          await rm(this.tempDirectory, { recursive: true, force: true });
      } catch {
        // ignore cleanup errors
      }
      this.tempDirectory = null;
    }
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export default PuppeteerManager;
