/** Portage de ui/composables/PodiumSection.kt. */

function buildPodiumBar(player, rank, heightFraction, flexGrow, { onClick, onLongClick, getScore }) {
  if (!player) return h('div', { class: 'podium-col', style: { flex: flexGrow } });

  const colorClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : 'bronze';
  const avatarSize = rank === 1 ? 70 : 55;
  const avatar = playerAvatarEl(player, avatarSize, { borderColor: player.color });
  attachLongPress(avatar, () => onClick(player), () => onLongClick(player));
  avatar.style.cursor = 'pointer';

  return h('div', { class: 'podium-col' + (rank === 1 ? ' rank1' : ''), style: { flex: flexGrow } }, [
    avatar,
    h('div', { class: 'podium-name', style: { fontSize: rank === 1 ? '15px' : '13px' } }, player.name),
    h('div', { class: 'podium-score' }, String(getScore(player))),
    h('div', { class: `podium-bar ${colorClass}`, style: { height: Math.round(heightFraction * 150) + 'px' } }, String(rank)),
  ]);
}

function buildPodium(podium, { onClick, onLongClick, getScore }) {
  const [first, second, third] = [podium[0], podium[1], podium[2]];
  return h('div', { class: 'podium-row' }, [
    buildPodiumBar(second, 2, 0.55, 1, { onClick, onLongClick, getScore }),
    buildPodiumBar(first, 1, 0.85, 1.2, { onClick, onLongClick, getScore }),
    buildPodiumBar(third, 3, 0.35, 1, { onClick, onLongClick, getScore }),
  ]);
}
