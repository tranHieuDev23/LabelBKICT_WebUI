import { Region } from 'src/app/services/dataaccess/api';
import { Coordinate, Eclipse, Rectangle, Shape } from './models';

export interface RegionSelectorContent {
  image: CanvasImageSource | null;
  imageOrigin: Coordinate;
  zoom: number;

  drawMarginEnabled: boolean;
  drawMargin: Rectangle;

  drawBoundaryEnabled: boolean;
  drawBoundary: Eclipse;

  regionList: Region[];
  isRegionListVisible: boolean;

  drawnShapeList: Shape[];

  cursorImagePosition: Coordinate;
}
