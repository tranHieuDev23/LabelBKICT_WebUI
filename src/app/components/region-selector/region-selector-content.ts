import { Region } from 'src/app/services/dataaccess/api';
import { Coordinate, Shape } from './models';

export interface RegionSelectorContent {
  image: CanvasImageSource | null;
  imageOrigin: Coordinate;
  zoom: number;

  regionList: Region[];
  isRegionListVisible: boolean;

  drawnShapeList: Shape[];

  cursorImagePosition: Coordinate;
}
