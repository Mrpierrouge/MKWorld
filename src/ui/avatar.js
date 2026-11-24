/**
 * Avatar circulaire d'un joueur. Par défaut (comme ScoreRow / PodiumBar / PlayerDetails côté
 * Android), un avatar manquant retombe sur l'image "mario". `initialsFallback: true` reproduit
 * le comportement spécifique de `PlayerAvatar` dans RaceResultScreen.kt (initiales sur fond
 * coloré quand il n'y a pas d'avatar).
 */
function playerAvatarEl(player, size, { initialsFallback = false, borderColor } = {}) {
  const color = player.color || DEFAULT_PROFILE_COLOR;
  if (!player.avatar && initialsFallback) {
    return h('div', {
      class: 'avatar-fallback',
      style: { width: size + 'px', height: size + 'px', background: color, fontSize: Math.round(size * 0.4) + 'px', border: '1px solid rgba(255,255,255,.5)' },
    }, ScoreState.initials(player));
  }
  const found = AVATARS.find((a) => a.id === player.avatar);
  const src = found ? found.img : DEFAULT_AVATAR.img;
  return h('img', {
    src,
    alt: '',
    class: 'avatar-circle',
    style: { width: size + 'px', height: size + 'px', border: `2px solid ${borderColor || color}` },
  });
}
