import { HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios, { Axios } from 'axios';
import {
  UnauthenticatedError,
  UnauthorizedError,
  UnknownAPIError,
} from './errors';
import { PinnedPage } from './schemas';

export class InvalidPinnedPageInformationError extends Error {
  constructor() {
    super('Invalid pinned page information');
  }
}

export class InvalidPinnedPageListArgument extends Error {
  constructor() {
    super('Invalid argument to retrieve pinned page list');
  }
}
export class PinnedPageNotFoundError extends Error {
  constructor() {
    super('Pinned page not found');
  }
}

@Injectable({
  providedIn: 'root',
})
export class PinnedPagesService {
  constructor(private readonly axios: Axios) {}

  public async createPinnedPage(
    url: string,
    description: string,
    screenshotData: Blob
  ): Promise<PinnedPage> {
    try {
      const formData = new FormData();
      formData.append('url', url);
      formData.append('description', description);
      formData.append('screenshot_file', screenshotData);
      const response = await this.axios.post('/api/pinned-pages', formData);
      return PinnedPage.fromJSON(response.data.pinned_page);
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidPinnedPageInformationError();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async getPinnedPageList(
    offset: number,
    limit: number
  ): Promise<{ totalPinnedPageCount: number; pinnedPageList: PinnedPage[] }> {
    try {
      const response = await this.axios.get('/api/pinned-pages', {
        params: { offset, limit },
      });
      const totalPinnedPageCount = response.data.total_pinned_page_count || 0;
      const pinnedPageList = response.data.pinned_page_list.map(
        PinnedPage.fromJSON
      );
      return { totalPinnedPageCount, pinnedPageList };
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.BadRequest:
          throw new InvalidPinnedPageListArgument();
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async updatePinnedPage(
    id: number,
    description: string | undefined
  ): Promise<PinnedPage> {
    try {
      const response = await this.axios.patch(`/api/pinned-pages/${id}`, {
        description,
      });
      return PinnedPage.fromJSON(response.data.pinned_page);
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new PinnedPageNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }

  public async deletePinnedPage(id: number): Promise<void> {
    try {
      const response = await this.axios.delete(`/api/pinned-pages/${id}`);
    } catch (e) {
      if (!axios.isAxiosError(e)) {
        throw e;
      }
      switch (e.response?.status) {
        case HttpStatusCode.Unauthorized:
          throw new UnauthenticatedError();
        case HttpStatusCode.Forbidden:
          throw new UnauthorizedError();
        case HttpStatusCode.NotFound:
          throw new PinnedPageNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }
}
