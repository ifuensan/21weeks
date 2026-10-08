# AGENTS.md — Instrucciones para agentes de IA en este repo

Este repo adopta el DCO 1.1 (ver `DCO` y `CONTRIBUTING.md`). Si eres un agente
de IA trabajando aquí, estas reglas son **obligatorias**:

## Al hacer commits

1. **NUNCA añadas `Signed-off-by`.** Solo lo pone el humano que responde del
   commit (con `git commit -s`). Tú no puedes certificar el DCO.
2. **NUNCA añadas `Co-authored-by` con una identidad de IA.** Una IA no es
   autora de nada en este repo.
3. **SÍ añade un trailer `Assisted-by`** declarándote:

   ```
   Assisted-by: AGENTE:MODELO [herramientas]
   ```

   Ejemplos: `Assisted-by: Kimi:K3`, `Assisted-by: Claude:claude-opus-4-5 [claude-code]`.

4. El comando correcto lo ejecuta el humano:

   ```bash
   git commit -s --trailer "Assisted-by: AGENTE:MODELO"
   ```

5. Si tu herramienta tiene atribución automática de co-autoría, debe estar
   desactivada (p. ej. `includeCoAuthoredBy: false` en Claude Code).

## Al escribir código

- El humano revisa y entiende cada cambio antes de firmarlo: explícale qué
  hace tu diff y por qué, de forma que pueda certificarlo de buena fe.
- Sigue el estilo del proyecto (Prettier, ESLint) y no añadas dependencias
  sin justificarlo.
