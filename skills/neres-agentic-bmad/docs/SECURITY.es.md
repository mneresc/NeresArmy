# Seguridad y supply chain

[Português](SECURITY.md) · [English](SECURITY.en.md) · [Español](SECURITY.es.md)

El workflow `Supply Chain Security` se ejecuta en pull requests, pushes a main y
manualmente. Intenta GitHub Dependency Review con señales OpenSSF, bloquea
vulnerabilidades runtime high/critical mediante `npm audit`, valida cada archivo vendorizado y genera
auditoría npm, SBOM CycloneDX e informe legible conservados durante 90 días.

Dependency Review requiere que Dependency Graph esté habilitado. Cuando no está
disponible, el workflow registra una advertencia y mantiene como gates obligatorios
la auditoría runtime, el SBOM y la validación del vendor.

El paquete público también tiene análisis independiente en
[Socket](https://socket.dev/npm/package/%40mneresc%2Fneres-agentic-bmad).

`vendor/bmad/PROVENANCE.json` fija origen, BMAD 6.11.0, licencia MIT, shasum e
integridad npm. `VENDOR_MANIFEST.json` registra SHA-256 y tamaño de cada archivo.
Las dependencias y scripts de instalación upstream no se distribuyen ni ejecutan.

Informe detalles explotables mediante un security advisory privado de GitHub, no
en una issue pública, y nunca incluya secretos.
