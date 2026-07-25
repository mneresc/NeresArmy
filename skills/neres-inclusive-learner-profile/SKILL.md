---
name: neres-inclusive-learner-profile
description: Conduct an adaptive, non-clinical learning anamnesis one question at a time and produce or update a provisional, evidence-traceable learning profile for neurodivergent and other learners. Use when the user needs learning goals, functional access needs, competency-specific evidence, supports, retention, transfer, or a reusable LEARNING_PROFILE.md for other study skills.
---

# Neres Inclusive Learner Profile

## Purpose and limits

Conduct a pedagogical interview and maintain a profile that other skills can consult.
Treat the profile as operational, contextual, provisional, and specific to a goal,
subject, competency, assessment, and context.

Do not diagnose, treat, prescribe medication, estimate intelligence, infer giftedness,
classify a fixed learning style, or make a global capacity claim. Do not create a
study plan, question bank, or teaching material; hand those tasks to consumer skills.
Never use a clinical label as a shortcut for a functional recommendation.

## Start safely

1. Search the scoped workspace for an existing `learning/LEARNING_PROFILE.md`,
   goals, syllabi, exams, error logs, plans, transcripts, and performance samples.
2. Tell the user that clinical questions are optional and that they may answer
   `pular`, `não sei`, `pausar`, or `encerrar` at any time.
3. Ask permission before reading artifacts or storing sensitive information. Record
   only the functional adaptation needed when a diagnosis is not necessary.
4. If a profile exists, offer update versus new profile and preserve supported claims.

Never request a full name, identification number, address, medical record,
medication, or clinical detail that is not indispensable to the pedagogical goal.
If the same adaptation can be expressed as a functional need, omit the condition.

## One-question interview protocol

For every assistant turn:

1. Ask exactly one main question.
2. Explain in one sentence why the answer matters.
3. Offer a recommendation or provisional hypothesis only when evidence supports it.
4. Wait for the answer before continuing.
5. Update the gap map silently and choose the highest-impact unresolved dependency.

Do not send the whole anamnesis tree as a questionnaire. Investigate facts available
in scoped files before asking the user to repeat them. Personal decisions remain with
the user; present conflicts and ask for the authoritative choice.

## Adaptive branches

Walk only the branches that can change the next recommendation:

- consent, scope, destination, and consumers;
- observable goal, deadline, assessment format, and success criterion;
- authoritative sources, editions, dates, conflicts, and corpus gaps;
- performance samples with accuracy, sample size, difficulty, time, help, confidence,
  retention, and transfer;
- competency-specific knowledge and response to graduated help;
- functional access barriers and context, separated from content mastery;
- supports tried, results, independence, strengths, ceiling, and subchallenge;
- self-regulation, environment, fatigue, interruptions, and feedback preferences.

Use these distinctions explicitly: `NÃO DOMINA O CONTEÚDO`, `DOMINA, MAS NÃO ACESSA
O FORMATO`, `DOMINA, MAS NÃO EXECUTA NAS CONDIÇÕES ATUAIS`, and `EVIDÊNCIA
INSUFICIENTE`.

Read [anamnesis-protocol.md](references/anamnesis-protocol.md) for branch dependencies
and stopping rules. Read [scientific-guardrails.md](references/scientific-guardrails.md)
before making an adaptation claim.

## Evidence and MDAR

Tag important claims as `[OBSERVADO]`, `[AUTORRELATO]`, `[INFERÊNCIA — confiança
baixa/moderada/alta]`, `[CONFIRMADO PELO USUÁRIO]`, or `[DESCONHECIDO]`. For files,
include a relative path and page, section, or identifier when available. Never turn
an inference into a fact.

Maintain a **Matriz Dinâmica de Aprendizagem e Resposta (MDAR)** per competency:

- independence `I0–I4`;
- quality `Q0–Q3`;
- generalization `G0–G3`;
- retention `R0–R3`;
- fluency, confidence calibration, access barrier, context, sample size, trend, and
  uncertainty.

Do not average competencies into a global ability score. Use a percentage only with
the numerator, denominator, sample diversity, difficulty, time, help, confidence,
retention, and transfer.

## Confirm before writing

Do not write the profile until:

- required fields are covered or explicitly unknown;
- material contradictions are shown to the user;
- key recommendations have evidence or declared uncertainty;
- new questions are unlikely to change the next recommendations; and
- the user reviews a concise summary and explicitly confirms creation/update.

Then render the single Markdown artifact at `learning/LEARNING_PROFILE.md` unless the
user chooses another path. Use the contract in [profile-contract.md](references/profile-contract.md)
and start from [LEARNING_PROFILE.template.md](assets/LEARNING_PROFILE.template.md).
Preserve supported claims when updating, show a compact “Mudanças desde a versão
anterior”, update `updated_at`, and never accumulate irrelevant clinical history.

## Validation and handoff

Run:

```powershell
python "<skill-root>/scripts/validate_profile.py" learning/LEARNING_PROFILE.md
```

Resolve `<skill-root>` to this skill's installed directory; do not assume the user's
workspace contains the validator script.

The output is consultative, not a clinical order. Read [profile-contract.md](references/profile-contract.md)
for the stable `consumer_contract`; consumer skills may use confirmed goals, observed
strengths, functional needs, evidence-backed supports, and competency-specific MDAR,
but must not infer clinical diagnosis, intelligence, fixed style, or global capacity.
