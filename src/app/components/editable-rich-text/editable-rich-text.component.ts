import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { QuillModules } from 'ngx-quill';

@Component({
  selector: 'app-editable-rich-text',
  templateUrl: './editable-rich-text.component.html',
  styleUrls: ['./editable-rich-text.component.scss'],
})
export class EditableRichTextComponent {
  @Input() public text = '';
  @Input() public editable = true;
  @Input() public placeholder = '';

  private _isEditing = false;
  public get isEditing(): boolean {
    return this._isEditing;
  }

  @Input()
  public set isEditing(v: boolean) {
    if (v === this._isEditing) {
      return;
    }
    this._isEditing = v;
    if (this._isEditing) {
      this.startEditing();
    } else {
      this.stopEditing();
    }
  }

  @Output() public textEdited = new EventEmitter<string>();
  @Output() public editingEnd = new EventEmitter<void>();

  public formGroup: UntypedFormGroup;
  public quillModules: QuillModules = {
    toolbar: [
      [
        'bold',
        'italic',
        'underline',
        { list: 'ordered' },
        { list: 'bullet' },
        { script: 'sub' },
        { script: 'super' },
        { color: [] },
        { background: [] },
        { align: [] },
        'link',
      ],
    ],
  };

  constructor(formBuilder: UntypedFormBuilder, private changeDetector: ChangeDetectorRef) {
    this.formGroup = formBuilder.group({
      text: ['', []],
    });
  }

  public startEditing(): void {
    if (!this.editable) {
      return;
    }
    this.formGroup.setValue({ text: this.text });
    this.isEditing = true;
    this.changeDetector.detectChanges();
  }

  public submit(): void {
    this.formGroup.updateValueAndValidity();
    if (this.formGroup.invalid) {
      return;
    }
    const newText = this.formGroup.value.text;
    if (newText !== this.text) {
      this.text = newText;
      this.textEdited.emit(newText);
    }
    this.stopEditing();
  }

  public stopEditing(): void {
    this.isEditing = false;
    this.editingEnd.emit();
  }
}
