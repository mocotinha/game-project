from __future__ import annotations

import os
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


PROJECT_ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = PROJECT_ROOT / ".env"


def load_envato_url() -> str:
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        if line.startswith("ENVATO_URL="):
            return line.split("=", 1)[1].strip().strip('"\'')
    return os.getenv("ENVATO_URL", "https://app.envato.com")


def main() -> int:
    url = load_envato_url()
    request = Request(url, headers={"User-Agent": "Aurora-Quem-Decide/0.1"}, method="HEAD")
    try:
        with urlopen(request, timeout=10) as response:
            print(f"Envato acessivel: {response.status} {response.url}")
            return 0
    except HTTPError as error:
        print(f"Envato respondeu: {error.code} {url}")
        return 0 if error.code in (401, 403, 405) else 1
    except URLError as error:
        print(f"Nao foi possivel conectar ao Envato: {error.reason}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
