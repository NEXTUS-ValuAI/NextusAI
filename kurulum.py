#!/usr/bin/env python3
"""ValuAI kurulum yardımcısı.

Bu betik:
- örnek ortam dosyalarını kopyalar,
- proje yapısını kontrol eder,
- istenirse sanal ortam oluşturur,
- Python ve frontend bağımlılıklarını kurar.
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / "backend"
FRONTEND = ROOT / "frontend"
VENV_DIR = ROOT / ".venv"

SABLON_DOSYALAR = [
    (BACKEND / ".env.example", BACKEND / ".env"),
    (FRONTEND / ".env.example", FRONTEND / ".env"),
]

KONTROL_EDILECEK_KLASORLER = [
    BACKEND,
    FRONTEND,
    FRONTEND / "src",
    FRONTEND / "public",
]


def yaz(mesaj: str) -> None:
    print(mesaj)


def komut_calistir(komut: list[str], cwd: Path | None = None) -> None:
    gorunen_komut = " ".join(komut)
    if cwd is not None:
        yaz(f"→ {gorunen_komut}  [çalışma dizini: {cwd}]")
    else:
        yaz(f"→ {gorunen_komut}")
    subprocess.run(komut, cwd=cwd, check=True)


def dosya_kopyala(kaynak: Path, hedef: Path, zorla: bool = False) -> bool:
    if not kaynak.exists():
        yaz(f"UYARI: Kaynak dosya bulunamadı: {kaynak}")
        return False

    if hedef.exists() and not zorla:
        yaz(f"Atlandı: {hedef} zaten var.")
        return False

    hedef.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(kaynak, hedef)
    yaz(f"Kopyalandı: {kaynak.name} -> {hedef.relative_to(ROOT)}")
    return True


def yapilandirmayi_hazirla(zorla: bool = False) -> int:
    yaz("ValuAI kurulum kontrolü başlıyor...")

    eksik_klasorler = []
    for klasor in KONTROL_EDILECEK_KLASORLER:
        if klasor.exists():
            yaz(f"OK   {klasor.relative_to(ROOT)}")
        else:
            yaz(f"YOK  {klasor.relative_to(ROOT)}")
            eksik_klasorler.append(klasor)

    if eksik_klasorler:
        yaz("Eksik klasörler bulunuyor; gerekli ise oluşturuluyor...")
        for klasor in eksik_klasorler:
            klasor.mkdir(parents=True, exist_ok=True)
            yaz(f"Oluşturuldu: {klasor.relative_to(ROOT)}")

    yaz("Ortam dosyaları hazırlanıyor...")
    for kaynak, hedef in SABLON_DOSYALAR:
        dosya_kopyala(kaynak, hedef, zorla=zorla)

    yaz("Hazırlık tamamlandı.")
    return 0


def sanal_ortam_pythona_gec() -> Path:
    if sys.platform == "win32":
        python_yolu = VENV_DIR / "Scripts" / "python.exe"
    else:
        python_yolu = VENV_DIR / "bin" / "python"

    if python_yolu.exists():
        return python_yolu

    yaz("Sanal ortam bulunamadı; .venv oluşturuluyor...")
    komut_calistir([sys.executable, "-m", "venv", str(VENV_DIR)])

    if not python_yolu.exists():
        raise FileNotFoundError("Sanal ortam oluşturuldu ama python yürütücüsü bulunamadı.")

    return python_yolu


def bagimliliklari_kur() -> int:
    yaz("Bağımlılık kurulumu başlıyor...")
    python_exec = sanal_ortam_pythona_gec()

    komut_calistir([str(python_exec), "-m", "pip", "install", "--upgrade", "pip"])
    komut_calistir([str(python_exec), "-m", "pip", "install", "-r", str(ROOT / "requirements.txt")])

    if (FRONTEND / "package.json").exists():
        if shutil.which("npm") is None:
            yaz("UYARI: npm bulunamadı. Frontend bağımlılıkları atlandı.")
        else:
            komut_calistir(["npm", "install"], cwd=FRONTEND)

    yaz("Bağımlılık kurulumu tamamlandı.")
    return 0


def yapisal_ozeti_yaz() -> None:
    yaz("")
    yaz("Özet:")
    yaz(f"- Root: {ROOT}")
    yaz(f"- Backend: {BACKEND.exists()}")
    yaz(f"- Frontend: {FRONTEND.exists()}")
    yaz(f"- .venv: {VENV_DIR.exists()}")
    yaz("- Kurulum tamamlanınca backend ve frontend ayrı terminallerde çalıştırılabilir.")


def ana() -> int:
    parser = argparse.ArgumentParser(
        description="ValuAI projesi için kurulum ve hazırlık yardımcı betiği."
    )
    parser.add_argument(
        "--kur",
        action="store_true",
        help="Sanal ortamı oluşturur ve Python ile frontend bağımlılıklarını kurar.",
    )
    parser.add_argument(
        "--zorla-env",
        action="store_true",
        help="Mevcut .env dosyalarını örneklerden tekrar yazar.",
    )
    args = parser.parse_args()

    yapilandirmayi_hazirla(zorla=args.zorla_env)

    if args.kur:
        bagimliliklari_kur()

    yapisal_ozeti_yaz()
    return 0


if __name__ == "__main__":
    raise SystemExit(ana())