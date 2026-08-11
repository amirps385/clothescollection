"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Upload, X, Link2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ImageFieldProps {
  value: string[];
  onChange: (images: string[]) => void;
  uploadsEnabled: boolean;
  multiple?: boolean;
}

export function ImageField({
  value,
  onChange,
  uploadsEnabled,
  multiple = false,
}: ImageFieldProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function add(next: string[]) {
    onChange(multiple ? [...value, ...next] : next.slice(0, 1));
  }

  function addUrl() {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (!/^https?:\/\//i.test(trimmed)) {
      setError("Image links must start with http:// or https://");
      return;
    }
    setError(null);
    add([trimmed]);
    setUrl("");
  }

  async function upload(files: FileList) {
    setError(null);
    setUploading(true);

    const uploaded: string[] = [];
    for (const file of Array.from(files).slice(0, multiple ? 10 : 1)) {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/admin/upload", { method: "POST", body });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `Could not upload ${file.name}.`);
        break;
      }
      const { url: uploadedUrl } = await res.json();
      uploaded.push(uploadedUrl);
    }

    setUploading(false);
    if (uploaded.length) add(uploaded);
    if (fileInput.current) fileInput.current.value = "";
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {value.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="relative h-24 w-24 overflow-hidden border border-izhaana-charcoal/15 bg-izhaana-cream"
            >
              {/* Arbitrary admin-supplied hosts won't match next.config remotePatterns. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.opacity = "0.25";
                }}
              />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-red-600"
                aria-label="Remove photo"
              >
                <X size={12} />
              </button>
              {multiple && i === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-center text-[10px] uppercase tracking-wider text-white">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {uploadsEnabled && (
        <div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple={multiple}
            hidden
            onChange={(e) => e.target.files?.length && upload(e.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={uploading}
            onClick={() => fileInput.current?.click()}
          >
            <Upload size={15} className="mr-1.5" />
            Upload photo
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Link2
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-izhaana-charcoal/35"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUrl();
              }
            }}
            placeholder="…or paste an image link"
            className="w-full border border-izhaana-charcoal/20 bg-white py-2 pl-9 pr-3 text-sm focus:border-izhaana-burgundy focus:outline-none"
          />
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addUrl}>
          Add
        </Button>
      </div>

      {!uploadsEnabled && (
        <p className="text-xs text-izhaana-charcoal/50">
          File uploads are turned off. Add a Blob store in Vercel to upload photos
          directly.
        </p>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
