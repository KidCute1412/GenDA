"use client";

import { useRef, useState } from "react";
import { CloudArrowUp, ICON_WEIGHT, Paperclip } from "./icons";

/**
 * Dropzone — hợp đồng tại docs/design-tokens.md 3.7.
 *
 * Ràng buộc quan trọng nhất (design.md 4.6d): kéo thả là thao tác CHUỘT THUẦN
 * TÚY, nên vùng này bắt buộc đồng thời là một nút bấm được bằng bàn phím. Không
 * có tính năng nào của GenDA chỉ thực hiện được bằng kéo thả — nếu không, sinh
 * viên dùng bàn phím sẽ không nộp được bài.
 *
 * Vì thế phần tử gốc là <button> thật, không phải <div onClick>: nó nhận tiêu
 * điểm, nhận Enter/Space và được trình đọc màn hình thông báo đúng vai trò mà
 * không cần khai báo role thủ công.
 */
export function Dropzone({
  id,
  accept,
  hint,
  multiple
}: {
  id: string;
  accept: string;
  hint: string;
  multiple?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragover, setDragover] = useState(false);
  const [files, setFiles] = useState<string[]>([]);

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    setFiles(Array.from(list).map((file) => file.name));
  }

  return (
    <div>
      <button
        type="button"
        className="dropzone"
        data-dragover={dragover ? "true" : undefined}
        aria-describedby={`${id}-hint`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragover(true);
        }}
        onDragLeave={() => setDragover(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragover(false);
          addFiles(event.dataTransfer.files);
        }}
      >
        <CloudArrowUp weight={ICON_WEIGHT} aria-hidden="true" />
        <span style={{ fontWeight: "var(--weight-medium)" }}>
          Kéo thả tệp vào đây hoặc bấm để duyệt tệp
        </span>
        <span className="text-caption" id={`${id}-hint`}>
          {hint}
        </span>
      </button>

      {/* Ô nhập thật bị ẩn khỏi thị giác nhưng vẫn nằm trong cây tài liệu, để
          nút phía trên kích hoạt được hộp chọn tệp của hệ điều hành. */}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        className="visually-hidden"
        tabIndex={-1}
        onChange={(event) => addFiles(event.target.files)}
      />

      {files.length > 0 ? (
        <ul
          className="stack stack--sm"
          style={{ listStyle: "none", margin: "var(--space-3) 0 0", padding: 0 }}
          aria-live="polite"
        >
          {files.map((file) => (
            <li key={file} className="cluster text-muted">
              <Paperclip weight={ICON_WEIGHT} aria-hidden="true" />
              {file}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
