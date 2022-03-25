import Axios from 'axios';
import pLimit from 'p-limit';
import { Observable } from 'rxjs';

export class UploadImageInput {
  constructor(
    public readonly file: any,
    public readonly imageTypeID: number | null,
    public readonly imageTagIDList: number[],
    public readonly description: string
  ) {}
}

export enum UploadImageBatchMessageType {
  UPLOAD_SUCCESS,
  UPLOAD_FAILURE,
  UPLOAD_COMPLETE,
}

export class UploadImageBatchMessage {
  constructor(
    public readonly type: UploadImageBatchMessageType,
    public readonly data: any
  ) {}
}

export async function uploadImage(input: UploadImageInput): Promise<void> {
  const formData = new FormData();
  formData.append('image_file', input.file);
  if (input.imageTypeID !== null) {
    formData.append('image_type_id', `${input.imageTypeID}`);
  }
  formData.append('description', input.description);
  formData.append('image_tag_id_list', input.imageTagIDList.join(','));
  await Axios.post('/api/images', formData);
}

export function uploadImageBatch(
  inputList: UploadImageInput[]
): Observable<UploadImageBatchMessage> {
  return new Observable<UploadImageBatchMessage>((subscriber) => {
    const limit = pLimit(5);
    const uploadImagePromiseList = inputList.map(async (input, index) => {
      try {
        await uploadImage(input);
        subscriber.next(
          new UploadImageBatchMessage(
            UploadImageBatchMessageType.UPLOAD_SUCCESS,
            index
          )
        );
      } catch {
        subscriber.next(
          new UploadImageBatchMessage(
            UploadImageBatchMessageType.UPLOAD_FAILURE,
            index
          )
        );
      }
    });
    Promise.all(uploadImagePromiseList).then(() => {
      subscriber.next(
        new UploadImageBatchMessage(
          UploadImageBatchMessageType.UPLOAD_COMPLETE,
          null
        )
      );
      subscriber.complete();
    });
  });
}
