import { Region } from 'src/app/services/dataaccess/api';
import { Coordinate, Polygon } from './models';

export interface RegionSelectorContent {
  image: CanvasImageSource | null;
  regionList: Region[];
  drawnPolygonList: Polygon[];
  imageOrigin: Coordinate;
  zoom: number;
  isDrawnRegionListVisible: boolean;
}
