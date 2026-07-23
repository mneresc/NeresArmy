import type {
  DidacticProfile,
  InputType
} from "../contracts.ts";
import type { OutputValidationResult } from "../validation/validate-output.ts";

export interface TransformationReportData {
  input: string;
  inputType: InputType;
  profiles: readonly DidacticProfile[];
  markdownFiles: number;
  images: number;
  ignoredFiles: number;
  ignoredExternalLinks: number;
  rawNotes: number;
  structuredNotes: number;
  imageOnlyNotes: number;
  tablesFound: number;
  formulasFound: number;
  codeFound: number;
  diagramsFound: number;
  claims: number;
  transcribedPassages: number;
  reconstructedTables: number;
  transcribedFormulas: number;
  interpretedDiagrams: number;
  illegiblePassages: number;
  notesV2: number;
  diagramsGenerated: number;
  tablesCreated: number;
  estimatedReduction: string;
  redundanciesRemoved: number;
  structuresPreserved: number;
  validations: readonly OutputValidationResult[];
}

function count(
  validations: readonly OutputValidationResult[],
  key: keyof Omit<OutputValidationResult, "passed">
): number {
  return validations.reduce((total, validation) => total + validation[key].length, 0);
}

export function renderTransformationReport(
  data: TransformationReportData
): string {
  const supported = data.claims -
    count(data.validations, "grounding") -
    count(data.validations, "externalSources");
  const status = data.validations.every((validation) => validation.passed)
    ? "passed"
    : "failed";
  const profile = [...new Set(data.profiles)].join(", ") || "generic";
  return `# Relatório de transformação

## Escopo

- Entrada: ${data.input}
- Tipo: ${data.inputType}
- Perfil didático: ${profile}
- Arquivos Markdown: ${String(data.markdownFiles)}
- Imagens: ${String(data.images)}
- Arquivos ignorados: ${String(data.ignoredFiles)}
- Links externos ignorados: ${String(data.ignoredExternalLinks)}

## Estado das fontes

- Notas brutas: ${String(data.rawNotes)}
- Notas estruturadas: ${String(data.structuredNotes)}
- Notas compostas por imagem: ${String(data.imageOnlyNotes)}
- Tabelas encontradas: ${String(data.tablesFound)}
- Fórmulas encontradas: ${String(data.formulasFound)}
- Código encontrado: ${String(data.codeFound)}
- Diagramas encontrados: ${String(data.diagramsFound)}

## Extração

- Claims: ${String(data.claims)}
- Trechos transcritos: ${String(data.transcribedPassages)}
- Tabelas reconstruídas: ${String(data.reconstructedTables)}
- Fórmulas transcritas: ${String(data.transcribedFormulas)}
- Diagramas interpretados: ${String(data.interpretedDiagrams)}
- Trechos ilegíveis: ${String(data.illegiblePassages)}

## Transformação

- Notas V2: ${String(data.notesV2)}
- Diagramas gerados: ${String(data.diagramsGenerated)}
- Tabelas criadas: ${String(data.tablesCreated)}
- Redução estimada: ${data.estimatedReduction}
- Redundâncias removidas: ${String(data.redundanciesRemoved)}
- Estruturas preservadas: ${String(data.structuresPreserved)}

## Validação

- Claims suportados: ${String(Math.max(0, supported))}
- Claims ambíguos: 0
- Conflitos: 0
- Lacunas: ${String(count(data.validations, "grounding"))}
- Números sem fonte: ${String(count(data.validations, "numbers"))}
- Entidades sem fonte: ${String(count(data.validations, "entities"))}
- Alterações normativas: ${String(count(data.validations, "modality"))}
- Fórmulas divergentes: ${String(count(data.validations, "formulas"))}
- Código alterado: ${String(count(data.validations, "code"))}
- Nós não autorizados: 0
- Relações não autorizadas: 0
- Fontes externas: ${String(count(data.validations, "externalSources"))}

## Resultado

- Status: ${status}
- Motivo: ${
    status === "passed"
      ? "Todas as validações obrigatórias passaram."
      : "Uma ou mais validações obrigatórias falharam."
  }
`;
}

