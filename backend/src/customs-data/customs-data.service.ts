import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ExchangeRate {
  country: string;
  currency: string;
  code: string;
  exportRate: number | null;
  importRate: number | null;
}

interface CachedData<T> {
  data: T;
  fetchedAt: string;
  expiresAt: number;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  views: number;
  url: string;
}

@Injectable()
export class CustomsDataService {
  private readonly logger = new Logger(CustomsDataService.name);
  private rateCache: CachedData<ExchangeRate[]> | null = null;
  private newsCache: CachedData<NewsItem[]> | null = null;

  private readonly RATE_TTL = 4 * 60 * 60 * 1000; // 4 hours
  private readonly NEWS_TTL = 1 * 60 * 60 * 1000; // 1 hour
  private readonly BASE_URL = 'https://www.customs.go.th';

  async getExchangeRates(): Promise<{
    rates: ExchangeRate[];
    fetchedAt: string;
    cached: boolean;
  }> {
    if (this.rateCache && Date.now() < this.rateCache.expiresAt) {
      return {
        rates: this.rateCache.data,
        fetchedAt: this.rateCache.fetchedAt,
        cached: true,
      };
    }

    try {
      const rates = await this.scrapeExchangeRates();
      const now = new Date().toISOString();
      this.rateCache = {
        data: rates,
        fetchedAt: now,
        expiresAt: Date.now() + this.RATE_TTL,
      };
      return { rates, fetchedAt: now, cached: false };
    } catch (error) {
      this.logger.error('Failed to scrape exchange rates', error);
      if (this.rateCache) {
        return {
          rates: this.rateCache.data,
          fetchedAt: this.rateCache.fetchedAt,
          cached: true,
        };
      }
      return { rates: [], fetchedAt: new Date().toISOString(), cached: false };
    }
  }

  async getNews(
    limit = 6,
  ): Promise<{ news: NewsItem[]; fetchedAt: string; cached: boolean }> {
    if (this.newsCache && Date.now() < this.newsCache.expiresAt) {
      return {
        news: this.newsCache.data.slice(0, limit),
        fetchedAt: this.newsCache.fetchedAt,
        cached: true,
      };
    }

    try {
      const news = await this.scrapeNews();
      const now = new Date().toISOString();
      this.newsCache = {
        data: news,
        fetchedAt: now,
        expiresAt: Date.now() + this.NEWS_TTL,
      };
      return { news: news.slice(0, limit), fetchedAt: now, cached: false };
    } catch (error) {
      this.logger.error('Failed to scrape news', error);
      if (this.newsCache) {
        return {
          news: this.newsCache.data.slice(0, limit),
          fetchedAt: this.newsCache.fetchedAt,
          cached: true,
        };
      }
      return { news: [], fetchedAt: new Date().toISOString(), cached: false };
    }
  }

  private async scrapeExchangeRates(): Promise<ExchangeRate[]> {
    const url = `${this.BASE_URL}/content_special.php?link=exch_search.php&lang=th&left_menu=nmenu_esevice_003`;
    const { data: html } = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'th,en;q=0.9',
      },
    });

    const $ = cheerio.load(html);
    const rates: ExchangeRate[] = [];

    // The table uses class "xtable_header" for header row
    // Data rows follow in subsequent <tr> elements
    $('table tr').each((_i, row) => {
      const cells = $(row).find('td');
      if (cells.length >= 6) {
        const country = $(cells[1]).text().trim();
        const currency = $(cells[2]).text().trim();
        const code = $(cells[3]).text().trim();
        const exportStr = $(cells[4]).text().trim();
        const importStr = $(cells[5]).text().trim();

        // Skip header row and empty rows
        if (
          code &&
          code.length === 3 &&
          code === code.toUpperCase() &&
          code !== 'รหั'
        ) {
          rates.push({
            country,
            currency,
            code,
            exportRate: this.parseRate(exportStr),
            importRate: this.parseRate(importStr),
          });
        }
      }
    });

    this.logger.log(`Scraped ${rates.length} exchange rates`);
    return rates;
  }

  private async scrapeNews(): Promise<NewsItem[]> {
    const url = `${this.BASE_URL}/list_strc_simple_with_date.php?ini_content=customs_news&ini_menu=menu_public_relations_160421_04&order_by=date&sort_type=0&lang=th&left_menu=menu_public_relations_160421_04_160421_01`;
    const { data: html } = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'th,en;q=0.9',
      },
    });

    const $ = cheerio.load(html);
    const news: NewsItem[] = [];

    $('table tr').each((_i, row) => {
      const cells = $(row).find('td');
      if (cells.length >= 4) {
        const link = $(cells[2]).find('a');
        const title = link.text().trim();
        const href = link.attr('href');
        const date = $(cells[3]).text().trim();
        const viewsText = $(cells[4])?.text()?.trim() || '0';

        if (title && href) {
          const idMatch = href.match(/current_id=([a-f0-9]+)/);
          news.push({
            id: idMatch ? idMatch[1] : String(news.length),
            title,
            date,
            views: parseInt(viewsText.replace(/,/g, ''), 10) || 0,
            url: href.startsWith('http') ? href : `${this.BASE_URL}/${href}`,
          });
        }
      }
    });

    this.logger.log(`Scraped ${news.length} news items`);
    return news;
  }

  private parseRate(str: string): number | null {
    const cleaned = str.replace(/,/g, '').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
}
