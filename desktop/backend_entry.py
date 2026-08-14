import os
import shutil
import sys
from pathlib import Path


def resource_path(relative: str) -> Path:
    base = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parents[1]))
    return base / relative


media_path = Path(os.environ.get("MEDIA_PATH", resource_path("data/images")))
media_path.mkdir(parents=True, exist_ok=True)
seed_images = resource_path("data/images")
if seed_images.exists() and seed_images.resolve() != media_path.resolve():
    for source in seed_images.iterdir():
        if source.is_file():
            target = media_path / source.name
            if not target.exists():
                shutil.copy2(source, target)

from app.main import app  # noqa: E402
from fastapi.staticfiles import StaticFiles  # noqa: E402

frontend_dir = Path(os.environ.get("FRONTEND_DIST_PATH", resource_path("frontend-dist")))
if frontend_dir.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dir), html=True), name="desktop-frontend")


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("VB_PORT", "9192"))
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="warning")
