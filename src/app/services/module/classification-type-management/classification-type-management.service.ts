import { Injectable } from "@angular/core";
import { ClassificationType, ClassificationTypesService } from "../../dataaccess/api";

@Injectable({
  providedIn: 'root',
})
export class ClassificationTypeManagementService {
  constructor(
    private readonly classificationTypesService: ClassificationTypesService
  ) {}

  public async getClassificationTypeList(): Promise<ClassificationType[]> {
    return await this.classificationTypesService.getClassificationTypeList();
  }
}