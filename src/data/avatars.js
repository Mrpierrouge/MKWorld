/**
 * Avatars & couleurs disponibles pour la création de profil.
 * Portage de ScoreViewModel.VALID_AVATARS / ProfileCreationPopup.availableAvatars.
 */

const AVATAR_IMG = 'assets/img/';

const AVATARS = [
  'mario', 'luigi', 'peach', 'yoshi',
  'bowser', 'toad', 'toadette', 'koopa',
  'wario', 'waluigi', 'baby_mario', 'baby_luigi',
  'baby_peach', 'baby_daisy', 'baby_rosalina', 'pauline',
  'shy_guy', 'donkey_kong', 'daisy', 'rosalina',
  'lakitu', 'birdo', 'king_boo', 'bowser_jr',
  'para_biddybud', 'peepa', 'swoop', 'stingby',
].map((name) => ({ id: name, img: `${AVATAR_IMG}${name}.png` }));

const DEFAULT_AVATAR = AVATARS[0]; // mario — fallback quand avatarRes est null (comme R.drawable.mario côté Android)

const AVATAR_COLORS = [
  '#FFCDD2', // rose clair
  '#E1BEE7', // violet clair
  '#BBDEFB', // bleu clair
  '#C8E6C9', // vert clair
  '#FFF9C4', // jaune clair
  '#FFCC80', // orange clair
];

const DEFAULT_PROFILE_COLOR = '#42A5F5';
