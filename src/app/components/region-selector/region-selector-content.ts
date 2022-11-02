import { Region } from 'src/app/services/dataaccess/api';
import { Coordinate, Polygon } from './models';

export interface RegionSelectorContent {
  image: CanvasImageSource | null;
  imageOrigin: Coordinate;
  zoom: number;

  regionList: Region[];
  isRegionListVisible: boolean;

  drawnPolygonList: Polygon[];

  cursorImagePosition: Coordinate;
}
