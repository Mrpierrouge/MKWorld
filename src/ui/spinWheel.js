/**
 * Portage de ui/composables/SpinWheel.kt.
 *
 * L'original fait défiler un VerticalPager de 500 pages avec un ralentissement progressif.
 * Ici on simplifie en changeant l'image affichée à chaque "pas" avec le même échéancier de
 * délais (port 1:1 de la formule Kotlin), ce qui donne la même sensation de machine à sous
 * qui ralentit avant de s'arrêter sur le résultat.
 */

function buildSpinSchedule(itemsLength, targetIndex, simple) {
  const currentPage = 0;
  const offsetInRound = currentPage % itemsLength;
  const fullSpins = 1;
  const stepsToTarget = (itemsLength - offsetInRound) + itemsLength * fullSpins + targetIndex;
  const finalPage = currentPage + stepsToTarget;
  const steps = [];

  if (simple) {
    const scrollPages = Math.min(stepsToTarget, 15);
    const scrollStart = finalPage - scrollPages;
    let currentDelay = 25;
    for (let page = scrollStart; page <= finalPage; page++) {
      const stepsLeft = finalPage - page;
      if (stepsLeft === 7) currentDelay = 25;
      else if (stepsLeft === 6) currentDelay = 40;
      else if (stepsLeft === 5) currentDelay = 60;
      else if (stepsLeft === 4) currentDelay = 90;
      else if (stepsLeft === 3) currentDelay = 140;
      else if (stepsLeft === 2) currentDelay = 220;
      else if (stepsLeft === 1) currentDelay = 340;
      steps.push({ page, delay: currentDelay });
    }
  } else {
    let currentDelay = 30;
    for (let page = currentPage + 1; page <= finalPage; page++) {
      const stepsLeft = finalPage - page;
      if (stepsLeft < 5) currentDelay += 80;
      else if (stepsLeft < 8) currentDelay += 30;
      steps.push({ page, delay: currentDelay });
    }
  }
  return { steps, finalPage };
}

/**
 * Monte une roue de sélection dans `container`.
 * @param {HTMLElement} container
 * @param {{items: Array, targetIndex: number, selectedItem: Object, simple?: boolean, compact?: boolean, onFinished: (finalPage:number)=>void}} opts
 * @returns {{cancel: () => void}}
 */
function mountSpinWheel(container, opts) {
  const { items, targetIndex, selectedItem, simple = false, compact = false } = opts;
  let cancelled = false;

  const blinkBox = h('div', { class: 'wheel-blink' }, h('span', {}, 'SÉLECTION EN COURS'));
  const img = h('img', { class: 'wheel-img', alt: '' });
  const stage = h('div', { class: 'wheel-stage' }, img);
  const nameBox = h('div', { class: 'wheel-name' });

  const root = h('div', { class: 'wheel-root' + (compact ? ' compact' : '') }, [blinkBox, stage, nameBox]);
  clearChildren(container);
  container.append(root);

  if (!items || items.length === 0) {
    stage.classList.add('empty');
    img.remove();
    stage.append(h('div', { class: 'wheel-empty-text' }, 'Merci de choisir au moins une carte'));
    blinkBox.classList.add('hidden');
    return { cancel() { cancelled = true; } };
  }

  img.src = items[0].large;

  (async () => {
    const { steps, finalPage } = buildSpinSchedule(items.length, Math.max(targetIndex, 0), simple);
    for (const step of steps) {
      await sleep(step.delay);
      if (cancelled) return;
      const idx = step.page % items.length;
      img.src = items[idx].large;
      img.alt = items[idx].name;
      img.classList.remove('pulse');
      void img.offsetWidth; // force reflow pour relancer l'animation CSS
      img.classList.add('pulse');
    }
    if (!simple) {
      await sleep(400);
      if (cancelled) return;
    }

    img.src = selectedItem.large;
    img.alt = selectedItem.name;
    blinkBox.classList.add('hidden');
    nameBox.append(h('div', { class: 'wheel-name-text' }, selectedItem.name));

    opts.onFinished(finalPage);
  })();

  return { cancel() { cancelled = true; } };
}
