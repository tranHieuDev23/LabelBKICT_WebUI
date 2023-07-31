import { Injectable } from '@angular/core';
import { PinnedPage, PinnedPagesService } from '../../dataaccess/api';
import { ScreenshotService } from '../../utils/screenshot/screenshot.service';

@Injectable({
  providedIn: 'root',
})
export class PinnedPageManagementService {
  constructor(
    private readonly pinnedPagesService: PinnedPagesService,
    private readonly screenshotService: ScreenshotService
  ) {}

  public async createPinnedPage(url: string, description: string): Promise<PinnedPage> {
    url = url.trim();
    description = description.trim();
    const screenshotData = await this.screenshotService.getScreenshot();
    return await this.pinnedPagesService.createPinnedPage(url, description, screenshotData);
  }

  public async getPinnedPageList(
    offset: number,
    limit: number
  ): Promise<{ totalPinnedPageCount: number; pinnedPageList: PinnedPage[] }> {
    return await this.pinnedPagesService.getPinnedPageList(offset, limit);
  }

  public async updatePinnedPage(id: number, description: string | undefined): Promise<PinnedPage> {
    description = description?.trim();
    return await this.pinnedPagesService.updatePinnedPage(id, description);
  }

  public async deletePinnedPage(id: number): Promise<void> {
    return await this.pinnedPagesService.deletePinnedPage(id);
  }
}
