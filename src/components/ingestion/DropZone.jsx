import React, { useRef, useState } from 'react';
import { ACCEPT_ATTR, MODALITIES } from '../../ingestion/pipeline.js';

export function DropZone({ onFiles, onLoadDemo }) {
  const inputRef = useRef(null);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      className={`dropzone ${dragging ? 'dragging' : ''}`}
      onDragEnter={(e) => {
        e.preventDefault();
        dragDepth.current += 1;
        setDragging(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (dragDepth.current === 0) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        dragDepth.current = 0;
        setDragging(false);
        if (e.dataTransfer.files?.length) onFiles(e.dataTransfer.files);
      }}
    >
      <div className="dropzone-icon" aria-hidden="true">
        ⬆
      </div>
      <div>
        <strong style={{ fontSize: 14 }}>Drop evidence files here</strong>
        <div className="text-secondary" style={{ fontSize: 12.5, marginTop: 3 }}>
          Chats, statements, documents, images, audio, video and financial records · up to 2 GB per item
        </div>
      </div>
      <div className="flex gap-8 wrap" style={{ justifyContent: 'center' }}>
        <button type="button" className="btn btn-primary" onClick={() => inputRef.current?.click()}>
          Browse files
        </button>
        <button type="button" className="btn" onClick={onLoadDemo}>
          Load demo batch
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        accept={ACCEPT_ATTR}
        aria-label="Choose evidence files"
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <div className="flex gap-6 wrap" style={{ justifyContent: 'center' }}>
        {Object.values(MODALITIES).map((m) => (
          <span key={m.id} className="chip" title={m.formats}>
            {m.icon} {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}
