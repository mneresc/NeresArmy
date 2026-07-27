# Plano de testes RED — S12

## Estratégia

Usar `unittest` e a standard library, descobertos automaticamente por
`scripts/test-python-skills.mjs`. Testar comportamento público dos módulos e das CLIs,
sem acoplamento a funções privadas ou raciocínio do modelo.

## Casos automatizados

1. Canvas mínimo válido.
2. ID duplicado.
3. Edge pendente.
4. Tipo de node inválido.
5. Campo obrigatório ausente.
6. Lado de edge inválido.
7. Cor inválida.
8. Sobreposição.
9. ID estável.
10. Saída estável para a mesma IR.
11. Source reference obrigatória no manifest.
12. Fixture de study map.
13. Fixture de recall map.
14. Aviso de densidade.
15. Routing seleciona Archify.
16. Fallback sem Archify.
17. Update preserva ID e posição.
18. Normalização de caminho Windows.
19. Escape JSON e quebras Markdown.
20. Metadata top-level não suportada.

## Comandos

```powershell
python skills/ob-study-visual-mapper/scripts/test_visual_map.py
npm run test:skill-scripts
npm run validate:skills
npm test
npm run typecheck
npm run build
npm run check
```

## Prova RED esperada

Antes da produção, o teste deve falhar ao importar `visual_map` e
`validate_canvas`, provando que o comportamento ainda não existe. Falhas de setup,
testes skipped ou placeholders não contam como RED.
