import { SPRITE_SYMBOLS } from "../spriteData";

/** Icon sprite (decorative); symbols are the home page's, verbatim. */
export default function SpriteSheet() {
  return (
    <svg
      className="sprite"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
      dangerouslySetInnerHTML={{ __html: SPRITE_SYMBOLS }}
    />
  );
}
