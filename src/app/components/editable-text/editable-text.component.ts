import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { FocusableDirective } from './focusable.directive';

@Component({
  selector: 'app-editable-text',
  templateUrl: './editable-text.component.html',
  styleUrls: ['./editable-text.component.scss'],
})
export class EditableTextComponent {
  @ViewChild(FocusableDirective) private textInput:
    | FocusableDirective
    | undefined;
  @Input() public text = '';
  @Input() public editable = true;
  @Input() public placeholder = '';
  @Input() public multiline = false;

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

  constructor(
    formBuilder: UntypedFormBuilder,
    private changeDetector: ChangeDetectorRef
  ) {
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
    this.textInput?.focus();
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
