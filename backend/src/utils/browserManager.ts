import puppeteer, { Browser } from "puppeteer";

class BrowserManager {
  private static instance: BrowserManager;
  private browser: Browser | null = null;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): BrowserManager {
    if (!BrowserManager.instance) {
      BrowserManager.instance = new BrowserManager();
    }
    return BrowserManager.instance;
  }

  async getBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    if (this.isInitializing) {
      await this.initPromise;
      return this.browser!;
    }

    this.isInitializing = true;
    this.initPromise = this.initializeBrowser();
    await this.initPromise;
    return this.browser!;
  }

  private async initializeBrowser(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        headless: true,
      });

      // Restart browser if it crashes
      this.browser.on("disconnected", async () => {
        this.browser = null;
        this.isInitializing = false;
      });
    } catch (error) {
      this.isInitializing = false;
      throw error;
    }
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    this.isInitializing = false;
  }
}

export const browserManager = BrowserManager.getInstance();
