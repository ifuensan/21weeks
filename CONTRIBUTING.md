# Contribuir a 21 Weeks

Gracias por contribuir. Este proyecto adopta el **Developer Certificate of Origin 1.1**
(ver el fichero [`DCO`](./DCO)) y una política explícita sobre uso de IA.

## DCO: todo commit lleva `Signed-off-by`

Cada commit debe incluir el sign-off de **una persona humana**:

```
Signed-off-by: Nombre Apellido <tu@email>
```

Se añade automáticamente con `git commit -s`. Con él certificas que:

- tienes derecho a aportar ese código bajo la licencia del proyecto, y
- **has revisado y entendido lo que aportas**, lo haya escrito quien lo haya escrito
  (tú, un compañero o un agente de IA).

El `Signed-off-by` es la pieza con peso real de este sistema. Un commit sin
sign-off humano válido no se fusiona (lo verifica CI).

## Política de IA

Usar agentes de IA está permitido y es habitual en este proyecto (de hecho,
gran parte nació así). Las reglas:

1. **La IA nunca pone `Signed-off-by`.** Solo lo pone el humano que responde
   del commit. Si un agente generó el código, quien lo commitea lo revisa,
   lo entiende y firma.
2. **El uso de IA se declara con un trailer `Assisted-by`:**

   ```
   Assisted-by: AGENTE:MODELO [herramientas]
   ```

   Ejemplos: `Assisted-by: Kimi:K3`, `Assisted-by: Claude:claude-opus-4-5 [claude-code]`.

3. **Nada de `Co-authored-by` para una IA.** Una IA no es autora: no puede
   certificar el DCO ni responder legalmente de la contribución. El authorship
   y el sign-off son siempre humanos.

`Assisted-by` es una declaración voluntaria y no verificable; su valor es la
transparencia, no el cumplimiento. Lo que se exige y se verifica es el
`Signed-off-by` humano.

### Formato de commit recomendado

```bash
git commit -s --trailer "Assisted-by: Kimi:K3"
```

produce:

```
fix: valida longitud de addr

Assisted-by: Kimi:K3
Signed-off-by: Iván Fuentes <ivan@example.com>
```

### Configura tu agente

Si usas un agente de código (Claude Code, Kimi Code, Cursor…), configúralo para que:

- **nunca** añada `Signed-off-by` ni `Co-authored-by`,
- **sí** añada el trailer `Assisted-by` correspondiente,
- tenga desactivada la atribución automática (en Claude Code,
  `includeCoAuthoredBy: false` en settings; confirma el nombre exacto en la
  documentación de tu versión).

Este repo incluye un [`AGENTS.md`](./AGENTS.md) con estas instrucciones, que
la mayoría de agentes leen automáticamente.

### Hook local (opcional pero recomendado)

```bash
git config core.hooksPath .githooks
```

El hook `commit-msg` rechaza commits sin `Signed-off-by` y sign-offs de
identidades de IA o bots.

## Merge: ojo con el squash

El **squash merge es la trampa habitual**: GitHub genera un mensaje nuevo y los
trailers (`Signed-off-by`, `Assisted-by`) se pueden perder o duplicar.
Preferimos **rebase merge** o **merge commit**. Si alguna vez se hace squash,
quien fusiona debe copiar los trailers al mensaje final.

## Firma criptográfica (opcional pero recomendable)

```bash
git config commit.gpgsign true
git config gpg.format ssh
git config user.signingkey ~/.ssh/id_ed25519.pub
```

y activa "Require signed commits" en la protección de la rama `main` en GitHub.
