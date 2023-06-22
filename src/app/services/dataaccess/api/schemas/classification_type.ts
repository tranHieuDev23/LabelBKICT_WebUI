export class ClassificationType {
    constructor(
        public id: number,
        public displayName: string
    ) {}

    public static fromJSON(classificationTypeJSON: any): ClassificationType {
        return new ClassificationType(
            classificationTypeJSON.classification_type_id || 0,
            classificationTypeJSON.display_name || ''
        );
    }
}