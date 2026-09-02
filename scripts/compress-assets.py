import os
from PIL import Image

ASSETS_DIR = r"c:\Users\USER\Documents\p23-Africa\base23\public\assets"

TARGET_FILES = [
    ("business-man1.jpg", 800, True),
    ("man2.jpg", 800, True),
    ("man4.jpg", 800, True),
    ("man3.jpg", 800, True),
    ("man1.jpg", 800, True),
    ("bg-referral.png", 1920, False),
    ("bottom-bg-form.png", 1920, False),
    ("top-bg-form.png", 1920, False),
    ("bg-framer-smartmatches.png", 1920, False),
    ("mobile-outline.png", 1080, False),
    ("bottom-form-bg-p.png", 1920, False),
    ("referral-full-pattern.png", 1920, False),
]

def compress():
    print("Starting asset compression...")
    total_before = 0
    total_after_webp = 0
    total_after_orig = 0

    for filename, max_dim, is_avatar in TARGET_FILES:
        filepath = os.path.join(ASSETS_DIR, filename)
        if not os.path.exists(filepath):
            print(f"Skipping {filename}: not found")
            continue

        size_before = os.path.getsize(filepath)
        total_before += size_before

        name, ext = os.path.splitext(filename)
        webp_path = os.path.join(ASSETS_DIR, f"{name}.webp")

        with Image.open(filepath) as img:
            # Handle orientation if needed and convert mode
            if img.mode in ("RGBA", "LA") and ext.lower() in (".jpg", ".jpeg"):
                img = img.convert("RGB")
            elif img.mode not in ("RGB", "RGBA"):
                img = img.convert("RGBA" if "A" in img.mode else "RGB")

            # Calculate resize dimensions
            w, h = img.size
            if max(w, h) > max_dim:
                scale = max_dim / max(w, h)
                new_w = int(w * scale)
                new_h = int(h * scale)
                resized_img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            else:
                resized_img = img

            # Save as WebP
            quality = 82 if is_avatar else 80
            resized_img.save(webp_path, "WEBP", quality=quality, method=6)
            size_webp = os.path.getsize(webp_path)
            total_after_webp += size_webp

            # Also overwrite original with high-efficiency version to prevent legacy 11MB download
            if ext.lower() in (".jpg", ".jpeg"):
                rgb_img = resized_img.convert("RGB") if resized_img.mode != "RGB" else resized_img
                rgb_img.save(filepath, "JPEG", quality=85, optimize=True)
            elif ext.lower() == ".png":
                resized_img.save(filepath, "PNG", optimize=True)
            
            size_orig_after = os.path.getsize(filepath)
            total_after_orig += size_orig_after

            print(f"Compressed {filename}:")
            print(f"  Before: {size_before / (1024*1024):.2f} MB")
            print(f"  WebP:   {size_webp / 1024:.1f} KB ({(1 - size_webp/size_before)*100:.1f}% reduction)")
            print(f"  Orig:   {size_orig_after / 1024:.1f} KB ({(1 - size_orig_after/size_before)*100:.1f}% reduction)")

    print("-" * 50)
    print(f"Total Before: {total_before / (1024*1024):.2f} MB")
    print(f"Total WebP:   {total_after_webp / (1024*1024):.2f} MB ({(1 - total_after_webp/total_before)*100:.1f}% reduction)")
    print(f"Total Orig:   {total_after_orig / (1024*1024):.2f} MB ({(1 - total_after_orig/total_before)*100:.1f}% reduction)")

if __name__ == "__main__":
    compress()
