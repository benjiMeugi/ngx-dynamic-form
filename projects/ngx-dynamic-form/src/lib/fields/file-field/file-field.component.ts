import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, ViewChild, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DragDropDirective } from '../../directives/drag-drop.directive';
import { FormFileItem } from '../../models/field-config.model';

@Component({
  selector: 'lib-file-field',
  standalone: true,
  imports: [CommonModule, DragDropDirective],
  templateUrl: './file-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FileFieldComponent),
    multi: true,
  }],
})
export class FileFieldComponent implements ControlValueAccessor, OnDestroy {
  @Input() multiple = false;
  @Input() accept = '';
  @Input() maxSizeMb?: number;
  @Input() maxFiles?: number;
  @Input() fieldId = 'file-field';
  @ViewChild('fileInputRef') fileInputRef!: ElementRef<HTMLInputElement>;
  @Input() tabIndex = 0;

  files: FormFileItem[] = [];
  errorMessage: string | null = null;
  isDisabled = false;

  private onChange: (v: FormFileItem[] | null) => void = () => {};
  private onTouchedFn: () => void = () => {};
  private previewUrls = new Map<File, string>();

  constructor(private cdr: ChangeDetectorRef) {}

  writeValue(value: FormFileItem[] | FormFileItem | null): void {
    if (!value) {
      this.files = [];
    } else if (Array.isArray(value)) {
      this.files = value;
    } else {
      this.files = [value];
    }
    this.cdr.markForCheck();
  }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouchedFn = fn; }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.cdr.markForCheck();
  }

  onFilesSelected(fileList: FileList): void {
    if (this.isDisabled) return;
    const incoming = Array.from(fileList);
    const candidates = this.multiple ? [...this.files, ...incoming] : incoming.slice(0, 1);
    this.errorMessage = null;

    if (this.maxSizeMb) {
      const tooBig = candidates.find(f => f.size && f.size > this.maxSizeMb! * 1024 * 1024);
      if (tooBig) {
        this.errorMessage = `"${tooBig.name}" dépasse ${this.maxSizeMb} Mo`;
        return;
      }
    }
    if (this.maxFiles && candidates.length > this.maxFiles) {
      this.errorMessage = `Maximum ${this.maxFiles} fichier(s) autorisé(s)`;
      return;
    }

    this.files = candidates;
    this.onTouchedFn();
    this.onChange(this.files);
    this.cdr.markForCheck();
  }

  triggerFileInput(): void {
    if (this.isDisabled) return;
    this.fileInputRef.nativeElement.click();
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) this.onFilesSelected(input.files);
    input.value = '';
  }

  removeFile(index: number): void {
    if (this.isDisabled) return;
    const removed = this.files[index];
    if (removed instanceof File && this.previewUrls.has(removed)) {
      URL.revokeObjectURL(this.previewUrls.get(removed)!);
      this.previewUrls.delete(removed);
    }
    this.files = this.files.filter((_, i) => i !== index);
    this.onChange(this.files);
    this.cdr.markForCheck();
  }

  previewUrl(file: FormFileItem): string | null {
    if (file instanceof File) {
      if (!file.type.startsWith('image/')) return null;
      if (!this.previewUrls.has(file)) {
        this.previewUrls.set(file, URL.createObjectURL(file));
      }
      return this.previewUrls.get(file)!;
    }

    if (file.url) {
      const isImg = file.type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(file.url || file.name);
      return isImg ? file.url : null;
    }

    return null;
  }

  fileIcon(file: FormFileItem): string {
    const type = file.type || '';
    const name = file.name || '';
    if (type === 'application/pdf' || name.endsWith('.pdf')) return '📄';
    if (type.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) return '📝';
    if (type.includes('sheet') || type.includes('excel') || name.endsWith('.xls') || name.endsWith('.xlsx')) return '📊';
    return '📁';
  }

  getFileUrl(file: FormFileItem): string | null {
    return !(file instanceof File) && file.url ? file.url : null;
  }

  ngOnDestroy(): void {
    this.previewUrls.forEach(url => URL.revokeObjectURL(url));
  }
}
