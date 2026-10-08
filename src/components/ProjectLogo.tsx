/**
 * Logo oficial del proyecto, normalizado a 128×128 en /public/logos/{id}.png.
 * Formato estándar en toda la app: tile cuadrado con esquinas redondeadas
 * y borde hairline; el tamaño lo fija quien lo usa.
 */
export function ProjectLogo({
  id,
  size = 32,
  className = "",
}: {
  id: string;
  size?: number;
  className?: string;
}) {
  return (
    <img
      src={`/logos/${id}.png`}
      alt=""
      loading="lazy"
      width={size}
      height={size}
      className={`logo-tile ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
