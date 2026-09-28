# Base de conocimiento: Normativa estudiantil UITEY (Universidad Yachay Tech)

Esta carpeta condensa la normativa publicada en la página oficial
**https://yachaytech.edu.ec/normativa/** de la Universidad de Investigación de
Tecnología Experimental Yachay Tech (UITEY, Ecuador), revisada en **septiembre de 2026**.
Fue construida para que un asistente virtual estudiantil pueda responder preguntas
de estudiantes (p. ej. el chatbot de la AEFN, Asociación de Estudiantes de Física y
Nanotecnología) sin necesidad de leer los ~150 documentos originales (3.895 páginas).

## Cómo usar esta base de conocimiento

| Si preguntan sobre... | Consulta el archivo |
|---|---|
| Notas, evaluación, asistencia, recuperación, IRA, regularidad, inglés obligatorio, terceras matrículas, reingreso, homologación, gratuidad | `02-regimen-academico-evaluacion.md` |
| Matrículas, valores/aranceles, recargos, retiros (nivelación y carrera), devolución de dinero, sistema MiYT, grupos socioeconómicos | `03-matriculas-aranceles-retiros.md` |
| Titulación/tesis, residencias estudiantiles, ayudantías, prácticas preprofesionales, tutorías | `04-titulacion-residencias-ayudantias.md` |
| Becas, ayudas económicas, psicología, urgencias médicas/sociales, discapacidad, ficha socioeconómica | `05-becas-bienestar-salud.md` |
| Biblioteca, laboratorios, clubes, examen de ubicación de inglés, viajes, ética de investigación, CEISH | `06-servicios-laboratorios-biblioteca.md` |
| Estatuto, LOES/CES, derechos y deberes, cogobierno, consejos, representantes estudiantiles, votaciones | `07-marco-institucional-participacion.md` |
| Compras públicas, talento humano, archivo documental, SST, planes institucionales y demás gestión interna | `08-inventario-administrativo.md` |
| "¿Qué documentos existen sobre X?" | `01-indice-general.md` (catálogo completo de las 148 entradas) |

## Reglas de respuesta para el asistente

1. **Cita siempre la fuente** al final de la afirmación, en el formato en que aparece
   aquí: `(Fuente: <documento>, art. X)`. Si la respuesta usa varios puntos, indica
   las fuentes de cada uno.
2. Si te piden el documento original, la tabla **Fuentes** del final de cada archivo
   temático contiene el enlace público (SharePoint de la universidad) a cada documento.
3. **No inventes plazos ni valores**: si el dato no está aquí, di que no lo tienes y
   sugiere confirmar con la dependencia responsable (cada resumen indica cuál es:
   Registro Académico, DSA, Bienestar, Decanato, etc.) o revisar el documento original.
4. Cuando la pregunta verse sobre gestión interna (compras, nómina, archivo), consulta
   el inventario 08 y ofrece el enlace del documento en vez de intentar responder en detalle.
5. Aclara cuando algo aplique solo a **nivelación**, **carrera de grado** o **posgrado**:
   las reglas difieren entre niveles.
6. La normativa cambia: si la pregunta es sensible (pérdida de cupo, sanciones,
   costos), recomienda verificar la vigencia con la fuente oficial antes de actuar.

## Limitaciones conocidas (a la fecha de corte)

- **2 documentos NO se pudieron descargar** porque la universidad compartió sus
  enlaces solo para usuarios con login institucional:
  - Manual de Uso del Sistema COBUS (Ref 020).
  - **Reglamento Interno para la Admisión y Nivelación (Ref 053)** — relevante para
    aspirantes y estudiantes de nivelación; el estudiante puede abrirlo con su cuenta
    institucional desde el enlace de la página de normativa.
- La carpeta "Seguimiento de Becas Otorgadas a Estudiantes de Tercer Nivel" (Ref 106)
  está **vacía** en el repositorio oficial de la universidad.
- 19 documentos son escaneados y fueron procesados con OCR: en cifras o números de
  artículo delicados, conviene validar contra el PDF original.
- Los documentos 002 y 003 (Reglamento General a la LOES / Decreto 742) son idénticos.
- Las fechas de aprobación de cada norma constan en el texto; las más recientes
  encontradas son de 2026 (Estatuto, Reglamento de Cogobierno, Lineamientos de
  Investigación) y 2025 (Reglamento Interno de Régimen Académico).

## Mantenimiento

Generado por scraping de la página de normativa + descarga anónima de los PDFs desde
el SharePoint de la universidad + extracción de texto (pdftotext/OCR) + síntesis
temática revisada. Para actualizar: repetir el proceso sobre las secciones que cambien
y regenerar el archivo temático afectado. Los 280 PDFs descargados y sus textos
extraídos se conservan como respaldo para re-síntesis.
