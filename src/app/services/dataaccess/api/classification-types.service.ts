import { Injectable } from "@angular/core";
import axios, { Axios } from "axios";
import { ClassificationType } from "./schemas";
import { HttpStatusCode } from "@angular/common/http";
import { UnauthenticatedError, UnauthorizedError, UnknownAPIError } from './errors';

export class ClassificationTypeNotFoundError extends Error {
  constructor() {
    super('Cannot find classification type');
  }
}

@Injectable({
  providedIn: 'root'
})
export class ClassificationTypesService {
  constructor(private readonly axios: Axios) {}

  public async getClassificationTypeList(): Promise<ClassificationType[]> {
    try {
      const response = await this.axios.get('/api/classification-types');
      return response.data.classification_type_list.map(ClassificationType.fromJSON);
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
          throw new ClassificationTypeNotFoundError();
        default:
          throw new UnknownAPIError(e);
      }
    }
  }
}