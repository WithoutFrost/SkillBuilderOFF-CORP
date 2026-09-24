// STARS OF THE CITY // HANA_NET COMBAT PROTOCOL CORE

// Application State
const state = {
  activeSkillIndex: 0,
  deck: [],
  spareVault: {
    rank1: 0,
    rank2: 0,
    rank3: 0
  },
  costFilter: 'all',
  moduleRankFilter: 'all',
  moduleSearchQuery: '',
  spareSearchQuery: '',
  glossaryCategory: 'all',
  glossarySearchQuery: '',
  // Set of enabled homebrew item IDs (empty by default: all HB OFF)
  enabledHbIds: new Set(),
  activeTab: 'tab-base'
};

function initDefaultDeck() {
  const saved = localStorage.getItem('sotc_deck_build');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        state.deck = parsed;
      }
    } catch (e) {
      console.error('BUFFER_PARSE_ERROR:', e);
    }
  }

  if (!state.deck || state.deck.length === 0) {
    const baseSingle = window.SKILL_BASES.find(b => b.id === 'single_strike') || window.SKILL_BASES[0];
    state.deck = [
      createSkillFromBase(baseSingle)
    ];
  }

  // Load spare vault state
  const savedVault = localStorage.getItem('sotc_spare_vault');
  if (savedVault) {
    try {
      state.spareVault = JSON.parse(savedVault);
    } catch (e) {
      console.error('VAULT_PARSE_ERROR:', e);
    }
  }

  // Load individual HB enabled set
  const savedHbSet = localStorage.getItem('sotc_enabled_hb_ids');
  if (savedHbSet) {
    try {
      state.enabledHbIds = new Set(JSON.parse(savedHbSet));
    } catch (e) {
      state.enabledHbIds = new Set();
    }
  }
}

function persistState() {
  localStorage.setItem('sotc_deck_build', JSON.stringify(state.deck));
  localStorage.setItem('sotc_spare_vault', JSON.stringify(state.spareVault));
  localStorage.setItem('sotc_enabled_hb_ids', JSON.stringify(Array.from(state.enabledHbIds)));
}

function persistDeck() {
  persistState();
}

function isItemAllowed(item) {
  if (!item.isHomebrew && item.category !== 'Community' && !item.credit) return true;
  return state.enabledHbIds.has(item.id);
}

function createSkillFromBase(base) {
  return {
    id: 'pg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    name: base.name,
    baseId: base.id,
    isUnique: false,
    cost: base.cost,
    rarity: 'Standard',
    customizableCost: base.customizableCost || false,
    source: base.credit ? `Community: ${base.credit}` : 'Core Official',
    isHomebrew: base.category === 'Community' || !!base.credit,
    dice: base.dice.map((d, index) => ({
      id: `die_${index + 1}`,
      type: d.type,
      allowedTypes: [...d.allowedTypes],
      selectedType: d.defaultType || d.allowedTypes[0],
      count: d.count,
      sides: d.sides,
      bonus: d.bonus,
      tags: [],
      installedModules: []
    })),
    installedModules: [],
    globalTags: []
  };
}

function createSkillFromUnique(unique) {
  return {
    id: 'pg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    name: unique.name,
    baseId: unique.id,
    isUnique: true,
    cost: unique.cost,
    rarity: unique.rarity || 'Unique',
    archetype: unique.archetype || '',
    source: 'Core Official',
    isHomebrew: false,
    dice: unique.dice.map((d, index) => ({
      id: `die_${index + 1}`,
      type: d.type,
      allowedTypes: [...d.allowedTypes],
      selectedType: d.defaultType || d.allowedTypes[0],
      count: d.count,
      sides: d.sides,
      bonus: d.bonus,
      tags: [...(d.tags || [])],
      installedModules: []
    })),
    installedModules: [],
    globalTags: [...(unique.innateTags || [])]
  };
}

function getActiveSkill() {
  if (state.deck.length === 0) return null;
  return state.deck[state.activeSkillIndex] || state.deck[0];
}

// ================= RENDER LOGIC =================

function renderDeckList() {
  const container = document.getElementById('deck-skill-list');
  const countBadge = document.getElementById('deck-count-badge');
  container.innerHTML = '';

  countBadge.textContent = `${state.deck.length} / 6 PAGES`;

  state.deck.forEach((skill, index) => {
    const card = document.createElement('div');
    card.className = `deck-item-card ${index === state.activeSkillIndex ? 'active' : ''}`;
    
    const totalModules = (skill.installedModules?.length || 0) + 
      skill.dice.reduce((acc, d) => acc + (d.installedModules?.length || 0), 0);

    const sourceBadge = skill.isHomebrew ? '<span class="badge-source badge-source-hb">[HB]</span>' : '';

    card.innerHTML = `
      <div class="deck-item-left">
        <span class="deck-item-cost">${skill.cost}L</span>
        <div>
          <div class="deck-item-title">${skill.name.toUpperCase()} ${sourceBadge}</div>
          <div class="deck-item-info">${skill.dice.length}DICE // ${totalModules}MODS ${skill.isUnique ? '// [UNQ]' : ''}</div>
        </div>
      </div>
      <button class="deck-item-delete" title="PURGE" data-del-index="${index}">[X]</button>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.deck-item-delete')) return;
      state.activeSkillIndex = index;
      renderAll();
    });

    container.appendChild(card);
  });

  container.querySelectorAll('.deck-item-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const delIdx = parseInt(btn.getAttribute('data-del-index'));
      if (state.deck.length <= 1) {
        showToast('BUFFER_ERR: DECK CANNOT BE EMPTY.');
        return;
      }
      state.deck.splice(delIdx, 1);
      if (state.activeSkillIndex >= state.deck.length) {
        state.activeSkillIndex = state.deck.length - 1;
      }
      persistDeck();
      renderAll();
      showToast('PAGE_PURGED_FROM_BUFFER.');
    });
  });

  updateDeckStats();
}

function updateDeckStats() {
  const avgCostEl = document.getElementById('stat-avg-cost');
  const totalDiceEl = document.getElementById('stat-total-dice');

  if (state.deck.length === 0) {
    avgCostEl.textContent = '0.0';
    totalDiceEl.textContent = '0 DADOS';
    return;
  }

  const totalCost = state.deck.reduce((sum, s) => sum + s.cost, 0);
  const avgCost = (totalCost / state.deck.length).toFixed(1);
  avgCostEl.textContent = `${avgCost} LIGHT`;

  let slash = 0, pierce = 0, blunt = 0, defense = 0;
  state.deck.forEach(s => {
    s.dice.forEach(d => {
      if (d.selectedType === 'Slash') slash++;
      else if (d.selectedType === 'Pierce') pierce++;
      else if (d.selectedType === 'Blunt') blunt++;
      else defense++;
    });
  });

  const totalDice = slash + pierce + blunt + defense;
  totalDiceEl.textContent = `${totalDice} DADOS`;

  if (totalDice > 0) {
    document.getElementById('bar-slash').style.width = `${(slash / totalDice) * 100}%`;
    document.getElementById('bar-pierce').style.width = `${(pierce / totalDice) * 100}%`;
    document.getElementById('bar-blunt').style.width = `${(blunt / totalDice) * 100}%`;
    document.getElementById('bar-defense').style.width = `${(defense / totalDice) * 100}%`;
  }
}

function renderBaseCatalog() {
  const grid = document.getElementById('base-cards-grid');
  grid.innerHTML = '';
  const currentSkill = getActiveSkill();

  const filtered = window.SKILL_BASES.filter(base => {
    // Individual item check for Homebrew
    if (!isItemAllowed(base)) return false;

    if (state.costFilter === 'all') return true;
    return base.cost === parseInt(state.costFilter);
  });

  filtered.forEach(base => {
    const card = document.createElement('div');
    const isSelected = currentSkill && currentSkill.baseId === base.id && !currentSkill.isUnique;
    card.className = `base-card-choice ${isSelected ? 'selected' : ''}`;

    const diceBadges = base.dice.map(d => {
      const sides = `1d${d.sides}${d.bonus ? `+${d.bonus}` : ''}`;
      return `<span class="term-badge">[${d.defaultType || d.type} ${sides}]</span>`;
    }).join(' ');

    const sourceText = base.credit ? `[HB: ${base.credit}]` : '[OFFICIAL]';
    const sourceClass = base.credit ? 'badge-source-hb' : 'badge-source-official';

    card.innerHTML = `
      <div class="base-card-top">
        <span class="base-card-name">${base.name.toUpperCase()} <span class="badge-source ${sourceClass}">${sourceText}</span></span>
        <span class="deck-item-cost">${base.cost}L</span>
      </div>
      <div class="base-card-dice-preview">${diceBadges || '<span class="text-dim">NO_DICE</span>'}</div>
      <p class="text-dim" style="font-size:11px; margin-top:4px;">${base.description}</p>
    `;

    card.addEventListener('click', () => {
      if (!currentSkill) return;
      const newSkill = createSkillFromBase(base);
      newSkill.id = currentSkill.id;
      state.deck[state.activeSkillIndex] = newSkill;
      persistDeck();
      renderAll();
      showToast(`BASE_LINKED: ${base.name.toUpperCase()}`);
    });

    grid.appendChild(card);
  });
}

function renderDiceCustomizer() {
  const container = document.getElementById('dice-type-selectors');
  container.innerHTML = '';
  const skill = getActiveSkill();
  if (!skill || skill.dice.length === 0) {
    container.innerHTML = '<p class="text-dim">PAGE_CONTAINS_NO_DICE_SLOTS.</p>';
    return;
  }

  skill.dice.forEach((die, index) => {
    const row = document.createElement('div');
    row.className = 'dice-config-row';

    const diceFormula = `${die.count}d${die.sides}${die.bonus ? `+${die.bonus}` : ''}`;

    let optionsHtml = '';
    die.allowedTypes.forEach(t => {
      optionsHtml += `<option value="${t}" ${die.selectedType === t ? 'selected' : ''}>[${t.toUpperCase()}]</option>`;
    });

    row.innerHTML = `
      <div>
        <span>SLOT_${index + 1}: <strong>${diceFormula}</strong></span>
        <span class="term-badge">${die.type.toUpperCase()}</span>
      </div>
      <div>
        <label class="text-dim" style="font-size:11px;">AFFINITY: </label>
        <select class="term-input select-die-type" data-die-index="${index}" style="padding:2px 6px; width:auto; display:inline-block;">
          ${optionsHtml}
        </select>
      </div>
    `;

    container.appendChild(row);
  });

  container.querySelectorAll('.select-die-type').forEach(select => {
    select.addEventListener('change', (e) => {
      const idx = parseInt(select.getAttribute('data-die-index'));
      skill.dice[idx].selectedType = select.value;
      persistDeck();
      renderCardPreview();
      updateDeckStats();
    });
  });
}

function renderUniqueSkills() {
  const grid = document.getElementById('unique-skills-grid');
  grid.innerHTML = '';
  const currentSkill = getActiveSkill();

  window.UNIQUE_SKILLS.forEach(unique => {
    const card = document.createElement('div');
    const isSelected = currentSkill && currentSkill.baseId === unique.id && currentSkill.isUnique;
    card.className = `base-card-choice ${isSelected ? 'selected' : ''}`;

    const diceBadges = unique.dice.map(d => {
      const sides = `1d${d.sides}${d.bonus ? `+${d.bonus}` : ''}`;
      return `<span class="term-badge" style="border-color:var(--term-amber); color:var(--term-amber)">[${d.defaultType.toUpperCase()} ${sides}]</span>`;
    }).join(' ');

    card.innerHTML = `
      <div class="base-card-top">
        <span class="base-card-name" style="color:var(--term-amber);">${unique.name.toUpperCase()} <span class="badge-source badge-source-official">[OFFICIAL]</span></span>
        <span class="deck-item-cost">${unique.cost}L</span>
      </div>
      <div class="base-card-dice-preview">${diceBadges}</div>
      <p class="text-dim" style="font-size:11px;">${unique.description}</p>
      <div style="margin-top:6px;"><span class="term-badge">${unique.archetype.toUpperCase()}</span></div>
    `;

    card.addEventListener('click', () => {
      const newSkill = createSkillFromUnique(unique);
      newSkill.id = currentSkill ? currentSkill.id : 'pg_' + Date.now();
      state.deck[state.activeSkillIndex] = newSkill;
      persistDeck();
      renderAll();
      showToast(`UNIQUE_PRESET_LOADED: ${unique.name.toUpperCase()}`);
    });

    grid.appendChild(card);
  });
}

function renderModuleCatalog() {
  const catalogList = document.getElementById('modules-catalog-list');
  const installedList = document.getElementById('modules-installed-list');
  catalogList.innerHTML = '';
  installedList.innerHTML = '';

  const skill = getActiveSkill();
  if (!skill) return;

  const filtered = window.MODULES.filter(mod => {
    // Check individual Homebrew allowance
    if (!isItemAllowed(mod)) return false;

    if (state.moduleRankFilter !== 'all' && mod.rank !== parseInt(state.moduleRankFilter)) return false;
    if (state.moduleSearchQuery) {
      const q = state.moduleSearchQuery.toLowerCase();
      const matchName = mod.name.toLowerCase().includes(q);
      const matchDesc = mod.description.toLowerCase().includes(q);
      const matchCat = (mod.category || '').toLowerCase().includes(q);
      const matchSrc = (mod.source || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat && !matchSrc) return false;
    }
    return true;
  });

  filtered.forEach(mod => {
    const item = document.createElement('div');
    item.className = 'module-item';

    let attachHtml = '';
    if (mod.target === 'die') {
      let optionsHtml = '';
      skill.dice.forEach((d, idx) => {
        const canAttach = !mod.filterDice || mod.filterDice(d);
        if (canAttach) {
          optionsHtml += `<option value="${idx}">DIE_${idx + 1} [${d.selectedType}]</option>`;
        }
      });
      if (optionsHtml) {
        attachHtml = `
          <div style="display:flex; gap:4px; align-items:center;">
            <select class="term-input select-mod-die" style="padding:2px 4px; font-size:10px; width:auto;">
              ${optionsHtml}
            </select>
            <button class="term-btn term-btn-primary module-attach-btn" style="padding:2px 8px; font-size:10px;">[MOUNT]</button>
          </div>
        `;
      } else {
        attachHtml = `<span class="text-dim" style="font-size:10px;">[INCOMPATIBLE_DICE]</span>`;
      }
    } else {
      attachHtml = `<button class="term-btn term-btn-primary module-attach-btn" style="padding:2px 8px; font-size:10px;">[MOUNT_PAGE]</button>`;
    }

    const sourceClass = mod.isHomebrew ? 'badge-source-hb' : 'badge-source-official';
    const sourceLabel = mod.isHomebrew ? `[HB: ${mod.source.replace('Community: ', '')}]` : '[OFFICIAL]';

    item.innerHTML = `
      <div class="module-item-header">
        <span class="module-item-title">${mod.name.toUpperCase()} <span class="badge-source ${sourceClass}">${sourceLabel}</span></span>
        <span class="term-badge">RANK_${mod.rank}</span>
      </div>
      <p class="module-item-desc">${mod.description}</p>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
        <span class="text-dim" style="font-size:10px;">CAT: ${mod.category || 'GENERAL'}</span>
        ${attachHtml}
      </div>
    `;

    const attachBtn = item.querySelector('.module-attach-btn');
    if (attachBtn) {
      attachBtn.addEventListener('click', () => {
        const dieSelect = item.querySelector('.select-mod-die');
        const dieIndex = dieSelect ? parseInt(dieSelect.value) : null;
        installModuleToSkill(skill, mod, dieIndex, false);
      });
    }

    catalogList.appendChild(item);
  });

  // Render Installed Modules List
  let totalInstalled = 0;
  
  (skill.installedModules || []).forEach((mod, idx) => {
    totalInstalled++;
    const row = document.createElement('div');
    row.className = 'module-item';
    const sourceTag = mod.isHomebrew ? '<span class="badge-source badge-source-hb">[HB]</span>' : '';
    const spareTag = mod.isSpare ? '<span class="term-badge" style="border-color:var(--term-green); color:var(--term-green)">[SPARE]</span>' : '';
    row.innerHTML = `
      <div class="module-item-header">
        <span class="module-item-title">${mod.name.toUpperCase()} ${sourceTag} ${spareTag}</span>
        <span class="term-badge" style="border-color:var(--term-amber); color:var(--term-amber)">RANK_${mod.rank} // GLOBAL</span>
      </div>
      <p class="module-item-desc">${mod.effectText}</p>
      <button class="term-btn term-btn-danger" style="align-self:flex-end; padding:1px 6px; font-size:10px;" data-remove-global="${idx}">[DETACH]</button>
    `;
    row.querySelector('[data-remove-global]').addEventListener('click', () => {
      const removed = skill.installedModules.splice(idx, 1)[0];
      if (removed && removed.isSpare) {
        state.spareVault[`rank${removed.rank}`] = (state.spareVault[`rank${removed.rank}`] || 0) + 1;
      }
      recalculateSkillDice(skill);
      persistDeck();
      renderAll();
      showToast('GLOBAL_MODULE_DETACHED.');
    });
    installedList.appendChild(row);
  });

  skill.dice.forEach((die, dieIdx) => {
    (die.installedModules || []).forEach((mod, modIdx) => {
      totalInstalled++;
      const row = document.createElement('div');
      row.className = 'module-item';
      const sourceTag = mod.isHomebrew ? '<span class="badge-source badge-source-hb">[HB]</span>' : '';
      const spareTag = mod.isSpare ? '<span class="term-badge" style="border-color:var(--term-green); color:var(--term-green)">[SPARE]</span>' : '';
      row.innerHTML = `
        <div class="module-item-header">
          <span class="module-item-title">${mod.name.toUpperCase()} ${sourceTag} ${spareTag}</span>
          <span class="term-badge">RANK_${mod.rank} // DIE_${dieIdx + 1}</span>
        </div>
        <p class="module-item-desc">${mod.effectText || mod.name}</p>
        <button class="term-btn term-btn-danger" style="align-self:flex-end; padding:1px 6px; font-size:10px;" data-remove-die="${dieIdx}" data-remove-mod="${modIdx}">[DETACH]</button>
      `;
      row.querySelector('[data-remove-die]').addEventListener('click', () => {
        const removed = die.installedModules.splice(modIdx, 1)[0];
        if (removed && removed.isSpare) {
          state.spareVault[`rank${removed.rank}`] = (state.spareVault[`rank${removed.rank}`] || 0) + 1;
        }
        recalculateSkillDice(skill);
        persistDeck();
        renderAll();
        showToast(`MODULE_DETACHED_FROM_DIE_${dieIdx + 1}.`);
      });
      installedList.appendChild(row);
    });
  });

  document.getElementById('installed-mod-count').textContent = totalInstalled;
}

// Declarative Recalculation of Dice Stats from Original Base
function recalculateSkillDice(skill) {
  if (skill.isUnique) {
    const origUnique = window.UNIQUE_SKILLS.find(u => u.id === skill.baseId);
    if (!origUnique) return;
    
    const hasExtraDieMod = (skill.installedModules || []).some(m => m.id === 'extra_die');
    if (!hasExtraDieMod) {
      skill.dice = skill.dice.filter(d => !d.isExtraDie);
    }

    skill.dice.forEach((die, idx) => {
      const origDie = origUnique.dice[idx];
      if (origDie) {
        die.sides = origDie.sides;
        die.bonus = origDie.bonus || 0;
      }
      (die.installedModules || []).forEach(m => {
        const modDef = window.MODULES.find(md => md.id === m.id);
        if (modDef && modDef.apply) {
          modDef.apply(die);
        }
      });
    });
    return;
  }

  const origBase = window.SKILL_BASES.find(b => b.id === skill.baseId);
  if (!origBase) return;

  const hasExtraDieMod = (skill.installedModules || []).some(m => m.id === 'extra_die');
  if (!hasExtraDieMod) {
    skill.dice = skill.dice.filter(d => !d.isExtraDie);
  } else if (!skill.dice.some(d => d.isExtraDie)) {
    const dieSidesByCost = [4, 6, 8, 10];
    const sides = dieSidesByCost[Math.min(skill.cost, 3)];
    skill.dice.push({
      id: `die_extra_${Date.now()}`,
      isExtraDie: true,
      type: 'Offensive',
      allowedTypes: ['Slash', 'Pierce', 'Blunt'],
      selectedType: 'Slash',
      count: 1,
      sides: sides,
      bonus: 0,
      tags: [],
      installedModules: []
    });
  }

  skill.dice.forEach((die, idx) => {
    const origDie = origBase.dice[idx];
    if (origDie) {
      die.sides = origDie.sides;
      die.bonus = origDie.bonus || 0;
    } else if (die.isExtraDie) {
      const dieSidesByCost = [4, 6, 8, 10];
      die.sides = dieSidesByCost[Math.min(skill.cost, 3)];
      die.bonus = 0;
    }

    (die.installedModules || []).forEach(m => {
      const modDef = window.MODULES.find(md => md.id === m.id);
      if (modDef && modDef.apply) {
        modDef.apply(die);
      }
    });
  });
}

function installModuleToSkill(skill, mod, dieIndex, isSpare = false) {
  if (isSpare) {
    const available = state.spareVault[`rank${mod.rank}`] || 0;
    if (available <= 0) {
      showToast(`NO_SPARE_AVAILABLE: VOCÊ NÃO TEM SPARE MODULE DE RANK ${mod.rank} NO COFRE.`);
      return;
    }
  }

  if (!isSpare && !skill.isUnique) {
    if (mod.rank === 3) {
      showToast('RANK_3_SPARE_ONLY: Módulos de Rank 3 só podem ser equipados como Spare Modules (aba SPARE_MODULES_VAULT).');
      return;
    }
    if (mod.rank === 1) {
      const currentR1Innate = (skill.installedModules || []).filter(m => m.rank === 1 && !m.isSpare).length +
        skill.dice.reduce((acc, d) => acc + (d.installedModules || []).filter(m => m.rank === 1 && !m.isSpare).length, 0);
      if (currentR1Innate >= 3) {
        showToast('INNATE_QUOTA_FULL: Limite inato de Rank 1 (3/3) atingido. Módulos adicionais devem ser equipados na aba SPARE_MODULES_VAULT.');
        return;
      }
    }
    if (mod.rank === 2) {
      const currentR2Innate = (skill.installedModules || []).filter(m => m.rank === 2 && !m.isSpare).length +
        skill.dice.reduce((acc, d) => acc + (d.installedModules || []).filter(m => m.rank === 2 && !m.isSpare).length, 0);
      if (currentR2Innate >= 1) {
        showToast('INNATE_QUOTA_FULL: Limite inato de Rank 2 (1/1) atingido. Módulos adicionais devem ser equipados na aba SPARE_MODULES_VAULT.');
        return;
      }
    }
  }

  const rank3Count = (skill.installedModules || []).filter(m => m.rank === 3).length +
    skill.dice.reduce((acc, d) => acc + (d.installedModules || []).filter(m => m.rank === 3).length, 0);

  if (mod.rank === 3 && rank3Count >= 2) {
    showToast('SYS_CAP_EXCEEDED: MAX 2 RANK_3 MODULES PER PAGE.');
    return;
  }

  if (mod.minCost && skill.cost < mod.minCost) {
    showToast(`COST_REQUIREMENT_UNMET: REQUIRES LIGHT_COST >= ${mod.minCost}`);
    return;
  }

  // Tag Collision Prevention
  if (mod.tag && !['[Power]', '[Die Size]', '[Extra Die]'].includes(mod.tag)) {
    if (mod.target === 'die' && dieIndex !== null && skill.dice[dieIndex]) {
      const targetDie = skill.dice[dieIndex];
      const existingDieTags = [
        ...(targetDie.tags || []),
        ...(targetDie.installedModules || []).map(m => m.tag).filter(Boolean)
      ];
      if (existingDieTags.includes(mod.tag)) {
        showToast(`TAG_COLLISION: DIE_${dieIndex + 1} ALREADY HAS TAG ${mod.tag}. EACH DIE CAN ONLY HAVE ONE OF EACH TAG.`);
        return;
      }
    } else if (mod.target === 'skill') {
      const existingGlobalTags = [
        ...(skill.globalTags || []),
        ...(skill.installedModules || []).map(m => m.tag).filter(Boolean)
      ];
      if (existingGlobalTags.includes(mod.tag)) {
        showToast(`TAG_COLLISION: PAGE ALREADY HAS GLOBAL TAG ${mod.tag}.`);
        return;
      }
    }
  }

  // Repeating Non-Repeating Check
  if (!mod.repeating) {
    const isAlreadyInstalled = (skill.installedModules || []).some(m => m.id === mod.id) ||
      skill.dice.some(d => (d.installedModules || []).some(m => m.id === mod.id));
    if (isAlreadyInstalled) {
      showToast(`MODULE_EXISTS: "${mod.name.toUpperCase()}" IS NON-REPEATING AND CAN ONLY BE MOUNTED ONCE.`);
      return;
    }
  }

  if (isSpare) {
    state.spareVault[`rank${mod.rank}`]--;
  }

  if (mod.target === 'die' && dieIndex !== null && skill.dice[dieIndex]) {
    const targetDie = skill.dice[dieIndex];
    const effect = typeof mod.effectText === 'function' ? mod.effectText(skill.cost, targetDie) : mod.effectText;
    targetDie.installedModules = targetDie.installedModules || [];
    targetDie.installedModules.push({
      id: mod.id,
      name: mod.name,
      rank: mod.rank,
      tag: mod.tag,
      isSpare: isSpare,
      isHomebrew: mod.isHomebrew || false,
      source: mod.source || 'Core Official',
      effectText: effect
    });
  } else {
    const effect = typeof mod.effectText === 'function' ? mod.effectText(skill.cost) : mod.effectText;
    skill.installedModules = skill.installedModules || [];
    skill.installedModules.push({
      id: mod.id,
      name: mod.name,
      rank: mod.rank,
      tag: mod.tag,
      isSpare: isSpare,
      isHomebrew: mod.isHomebrew || false,
      source: mod.source || 'Core Official',
      effectText: effect
    });
  }

  recalculateSkillDice(skill);
  persistState();
  renderAll();
  showToast(isSpare ? `SPARE_MOUNTED (RANK ${mod.rank}): ${mod.name.toUpperCase()}` : `MODULE_MOUNTED: ${mod.name.toUpperCase()}`);
}

function validateSkill(skill) {
  const issues = [];
  if (!skill) return issues;

  if (skill.isUnique) {
    const totalInstalled = (skill.installedModules || []).length +
      skill.dice.reduce((acc, d) => acc + (d.installedModules || []).length, 0);
    if (totalInstalled > 0) {
      issues.push({
        type: 'warning',
        text: 'UNIQUE_PAGE_NOTE: Preset pages do not consume baseline innate modules.'
      });
    }
  }

  const rank3Count = (skill.installedModules || []).filter(m => m.rank === 3).length +
    skill.dice.reduce((acc, d) => acc + (d.installedModules || []).filter(m => m.rank === 3).length, 0);
  if (rank3Count > 2) {
    issues.push({
      type: 'error',
      text: `RANK_3_CAP_VIOLATION: ${rank3Count} modules attached (MAX_PERMITTED: 2).`
    });
  }

  const installedIds = [
    ...(skill.installedModules || []).map(m => m.id),
    ...skill.dice.flatMap(d => (d.installedModules || []).map(m => m.id))
  ];
  const counts = {};
  installedIds.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
  Object.keys(counts).forEach(id => {
    const modDef = window.MODULES.find(m => m.id === id);
    if (modDef && !modDef.repeating && counts[id] > 1) {
      issues.push({
        type: 'error',
        text: `NON_REPEATING_COLLISION: "${modDef.name.toUpperCase()}" mounted ${counts[id]} times.`
      });
    }
  });

  (skill.installedModules || []).forEach(m => {
    const modDef = window.MODULES.find(md => md.id === m.id);
    if (modDef && modDef.minCost && skill.cost < modDef.minCost) {
      issues.push({
        type: 'error',
        text: `LIGHT_COST_INSUFFICIENT: "${modDef.name.toUpperCase()}" requires Light >= ${modDef.minCost}.`
      });
    }
  });

  if (!skill.isUnique) {
    const r1Innate = (skill.installedModules || []).filter(m => m.rank === 1 && !m.isSpare).length +
      skill.dice.reduce((acc, d) => acc + (d.installedModules || []).filter(m => m.rank === 1 && !m.isSpare).length, 0);
    const r2Innate = (skill.installedModules || []).filter(m => m.rank === 2 && !m.isSpare).length +
      skill.dice.reduce((acc, d) => acc + (d.installedModules || []).filter(m => m.rank === 2 && !m.isSpare).length, 0);
    const r3Innate = (skill.installedModules || []).filter(m => m.rank === 3 && !m.isSpare).length +
      skill.dice.reduce((acc, d) => acc + (d.installedModules || []).filter(m => m.rank === 3 && !m.isSpare).length, 0);

    if (r1Innate > 3) {
      issues.push({
        type: 'error',
        text: `INNATE_QUOTA_EXCEEDED: ${r1Innate}/3 Rank 1 inatos. Módulos adicionais precisam ser instalados como Spare Modules no SPARE_MODULES_VAULT.`
      });
    }
    if (r2Innate > 1) {
      issues.push({
        type: 'error',
        text: `INNATE_QUOTA_EXCEEDED: ${r2Innate}/1 Rank 2 inatos. Módulos adicionais precisam ser instalados como Spare Modules no SPARE_MODULES_VAULT.`
      });
    }
    if (r3Innate > 0) {
      issues.push({
        type: 'error',
        text: `INVALID_INNATE_RANK: Rank 3 só pode ser equipado como Spare Module no SPARE_MODULES_VAULT.`
      });
    }

    if (r1Innate < 3 || r2Innate < 1) {
      issues.push({
        type: 'info',
        text: `INNATE_QUOTA_INCOMPLETE: ${r1Innate}/3 Rank 1 e ${r2Innate}/1 Rank 2 inatos alocados.`
      });
    }
  }

  return issues;
}

// Render dynamic realtime annotations for the active card
function renderRealtimeAnnotations(skill) {
  const container = document.getElementById('card-annotations-list');
  if (!container) return;
  container.innerHTML = '';

  if (!skill) {
    container.innerHTML = '<span class="text-dim">NO_ACTIVE_CARD_SELECTED.</span>';
    return;
  }

  const allEffectTexts = [
    ...(skill.globalTags || []),
    ...(skill.installedModules || []).map(m => m.effectText || m.name),
    ...skill.dice.flatMap(d => [
      ...(d.tags || []),
      ...(d.installedModules || []).map(m => m.effectText || m.name)
    ])
  ].filter(Boolean);

  const matchedEntries = [];
  const addedNames = new Set();

  const scanList = [
    ...(window.GLOSSARY.buffs || []),
    ...(window.GLOSSARY.debuffs || []),
    ...(window.GLOSSARY.boons || []),
    ...(window.GLOSSARY.ailments || []),
    ...(window.GLOSSARY.triggers || []),
    ...(window.GLOSSARY.tags || []),
    ...(window.GLOSSARY.specialStatuses || [])
  ];

  scanList.forEach(entry => {
    const cleanName = entry.name.replace(/[\[\]]/g, '');
    const regex = new RegExp(`\\b${cleanName}\\b|\\[${cleanName}\\]`, 'i');
    const isPresent = allEffectTexts.some(txt => regex.test(txt));
    if (isPresent && !addedNames.has(entry.name)) {
      addedNames.add(entry.name);
      matchedEntries.push(entry);
    }
  });

  if (matchedEntries.length === 0) {
    container.innerHTML = '<span class="text-dim">PAGE_HAS_NO_DETECTED_STATUSES_OR_TRIGGERS.</span>';
    return;
  }

  matchedEntries.forEach(item => {
    const card = document.createElement('div');
    card.className = 'annotation-card';
    card.innerHTML = `
      <div class="annotation-title">
        <span>${item.name.toUpperCase()}</span>
        <span class="term-badge">${item.type.toUpperCase()}</span>
      </div>
      <div class="annotation-desc">${item.desc}</div>
    `;
    container.appendChild(card);
  });
}

function renderCardPreview() {
  const skill = getActiveSkill();
  if (!skill) return;

  document.getElementById('card-render-cost').textContent = skill.cost;
  document.getElementById('card-render-name').textContent = skill.name.toUpperCase();
  document.getElementById('card-render-rarity').textContent = skill.isUnique ? `UNIQUE // ${skill.archetype.toUpperCase() || 'PRESET'}` : 'STANDARD COMBAT PAGE';
  document.getElementById('input-skill-name').value = skill.name;
  document.getElementById('badge-skill-cost').textContent = `LIGHT_REQ: ${skill.cost}`;
  document.getElementById('badge-skill-type').textContent = skill.isUnique ? 'UNIQUE_SKILL' : 'STANDARD_SKILL';

  const r1Count = (skill.installedModules || []).filter(m => m.rank === 1).length +
    skill.dice.reduce((acc, d) => acc + (d.installedModules || []).filter(m => m.rank === 1).length, 0);
  const r2Count = (skill.installedModules || []).filter(m => m.rank === 2).length +
    skill.dice.reduce((acc, d) => acc + (d.installedModules || []).filter(m => m.rank === 2).length, 0);
  const r3Count = (skill.installedModules || []).filter(m => m.rank === 3).length +
    skill.dice.reduce((acc, d) => acc + (d.installedModules || []).filter(m => m.rank === 3).length, 0);
  const totalMod = r1Count + r2Count + r3Count;

  const r1Innate = Math.min(3, (skill.installedModules || []).filter(m => m.rank === 1 && !m.isSpare).length +
    skill.dice.reduce((acc, d) => acc + (d.installedModules || []).filter(m => m.rank === 1 && !m.isSpare).length, 0));
  const r2Innate = Math.min(1, (skill.installedModules || []).filter(m => m.rank === 2 && !m.isSpare).length +
    skill.dice.reduce((acc, d) => acc + (d.installedModules || []).filter(m => m.rank === 2 && !m.isSpare).length, 0));
  const totalInnate = r1Innate + r2Innate;

  const totalSpareAttached = (skill.installedModules || []).filter(m => m.isSpare).length +
    skill.dice.reduce((acc, d) => acc + (d.installedModules || []).filter(m => m.isSpare).length, 0);

  const badgeModEl = document.getElementById('badge-module-count');
  if (skill.isUnique) {
    badgeModEl.textContent = `MODS: ${totalMod} [PRESET${totalSpareAttached > 0 ? ` + ${totalSpareAttached} SPARES` : ''}]`;
  } else {
    if (totalSpareAttached > 0) {
      badgeModEl.textContent = `MODS: ${totalMod} [INATOS: ${totalInnate}/4 | SPARES: +${totalSpareAttached}]`;
    } else {
      badgeModEl.textContent = `MODS: ${totalMod}/4 [R1: ${r1Count}/3 | R2: ${r2Count}/1${r3Count ? ` | R3: ${r3Count}` : ''}]`;
    }
  }

  const issues = validateSkill(skill);
  const statusBadge = document.getElementById('badge-validation-status');
  const valBox = document.getElementById('card-validation-box');

  const hasError = issues.some(i => i.type === 'error');
  const hasWarning = issues.some(i => i.type === 'warning');

  if (hasError) {
    statusBadge.className = 'term-badge badge-danger';
    statusBadge.textContent = 'STATUS: RULE_ERROR';
    valBox.className = 'card-validation-box error';
    valBox.innerHTML = issues.map(i => `<div class="validation-item">[ERROR] ${i.text}</div>`).join('');
  } else if (hasWarning) {
    statusBadge.className = 'term-badge badge-warning';
    statusBadge.textContent = 'STATUS: WARNING';
    valBox.className = 'card-validation-box warning';
    valBox.innerHTML = issues.map(i => `<div class="validation-item">[WARN] ${i.text}</div>`).join('');
  } else if (issues.length > 0) {
    statusBadge.className = 'term-badge badge-warning';
    statusBadge.textContent = 'STATUS: PENDING_MODS';
    valBox.className = 'card-validation-box valid';
    valBox.innerHTML = issues.map(i => `<div class="validation-item">[INFO] ${i.text}</div>`).join('');
  } else {
    statusBadge.className = 'term-badge badge-valid';
    statusBadge.textContent = 'STATUS: VALID';
    valBox.className = 'card-validation-box valid';
    valBox.innerHTML = '<div class="validation-item">[PASS] ALL SYSTEM CONSTRAINTS VERIFIED. READY FOR COMBAT.</div>';
  }

  const globalBox = document.getElementById('card-render-global-effects');
  globalBox.innerHTML = '';
  
  const allGlobalEffects = [
    ...(skill.globalTags || []),
    ...(skill.installedModules || []).map(m => m.effectText)
  ];

  if (allGlobalEffects.length > 0) {
    globalBox.style.display = 'block';
    globalBox.innerHTML = allGlobalEffects.map(e => `<div>&gt; ${e}</div>`).join('');
  } else {
    globalBox.style.display = 'none';
  }

  const diceList = document.getElementById('card-render-dice-list');
  diceList.innerHTML = '';

  skill.dice.forEach((die, idx) => {
    const row = document.createElement('div');
    row.className = 'card-die-row';

    const diceFormula = `${die.count}d${die.sides}${die.bonus ? `+${die.bonus}` : ''}`;
    const allDieEffects = [
      ...(die.tags || []),
      ...(die.installedModules || []).map(m => m.effectText).filter(Boolean)
    ].join(' // ');

    row.innerHTML = `
      <div class="card-die-badge ${die.selectedType}">
        <span>[${die.selectedType.toUpperCase()} ${diceFormula}]</span>
      </div>
      <div class="card-die-text">${allDieEffects || '<span class="text-dim">NO_ADDITIONAL_EFFECTS</span>'}</div>
    `;
    diceList.appendChild(row);
  });

  const totalInstalled = (skill.installedModules?.length || 0) + 
    skill.dice.reduce((acc, d) => acc + (d.installedModules?.length || 0), 0);
  document.getElementById('card-render-modules-badge').textContent = `${totalInstalled} MODS`;

  renderRealtimeAnnotations(skill);
}

// Render Spare Modules Vault and Direct Activator
function renderSpareVault() {
  document.getElementById('spare-count-r1').textContent = state.spareVault.rank1 || 0;
  document.getElementById('spare-count-r2').textContent = state.spareVault.rank2 || 0;
  document.getElementById('spare-count-r3').textContent = state.spareVault.rank3 || 0;

  let deckActiveMods = 0;
  state.deck.forEach(s => {
    deckActiveMods += (s.installedModules?.length || 0) +
      s.dice.reduce((acc, d) => acc + (d.installedModules?.length || 0), 0);
  });
  document.getElementById('deck-total-active-mods').textContent = `${deckActiveMods} ATTACHED`;

  // Render Spare Module direct activation selector
  const selectorList = document.getElementById('spare-modules-selector-list');
  if (selectorList) {
    selectorList.innerHTML = '';
    const skill = getActiveSkill();

    const filtered = window.MODULES.filter(mod => {
      if (!isItemAllowed(mod)) return false;
      if (state.spareSearchQuery) {
        const q = state.spareSearchQuery.toLowerCase();
        const matchName = mod.name.toLowerCase().includes(q);
        const matchDesc = mod.description.toLowerCase().includes(q);
        const matchCat = (mod.category || '').toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCat) return false;
      }
      return true;
    });

    filtered.forEach(mod => {
      const available = state.spareVault[`rank${mod.rank}`] || 0;
      const item = document.createElement('div');
      item.className = 'module-item';

      let attachHtml = '';
      if (skill) {
        if (mod.target === 'die') {
          let optionsHtml = '';
          skill.dice.forEach((d, idx) => {
            const canAttach = !mod.filterDice || mod.filterDice(d);
            if (canAttach) {
              optionsHtml += `<option value="${idx}">DIE_${idx + 1} [${d.selectedType}]</option>`;
            }
          });
          if (optionsHtml) {
            attachHtml = `
              <div style="display:flex; gap:4px; align-items:center;">
                <select class="term-input select-spare-die" style="padding:2px 4px; font-size:10px; width:auto;">
                  ${optionsHtml}
                </select>
                <button class="term-btn term-btn-primary spare-attach-btn" ${available <= 0 ? 'disabled style="opacity:0.4;"' : ''} style="padding:2px 8px; font-size:10px;">[MOUNT_SPARE]</button>
              </div>
            `;
          } else {
            attachHtml = `<span class="text-dim" style="font-size:10px;">[INCOMPATIBLE_DICE]</span>`;
          }
        } else {
          attachHtml = `<button class="term-btn term-btn-primary spare-attach-btn" ${available <= 0 ? 'disabled style="opacity:0.4;"' : ''} style="padding:2px 8px; font-size:10px;">[MOUNT_PAGE_SPARE]</button>`;
        }
      }

      const sourceClass = mod.isHomebrew ? 'badge-source-hb' : 'badge-source-official';
      const sourceLabel = mod.isHomebrew ? `[HB: ${mod.source.replace('Community: ', '')}]` : '[OFFICIAL]';

      item.innerHTML = `
        <div class="module-item-header">
          <span class="module-item-title">${mod.name.toUpperCase()} <span class="badge-source ${sourceClass}">${sourceLabel}</span></span>
          <span class="term-badge" style="border-color:${available > 0 ? 'var(--term-green)' : 'var(--term-border)'}; color:${available > 0 ? 'var(--term-green)' : 'var(--text-dim)'}">RANK_${mod.rank} (VAULT: ${available})</span>
        </div>
        <p class="module-item-desc">${mod.description}</p>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
          <span class="text-dim" style="font-size:10px;">CAT: ${mod.category || 'GENERAL'}</span>
          ${attachHtml}
        </div>
      `;

      const attachBtn = item.querySelector('.spare-attach-btn');
      if (attachBtn && available > 0 && skill) {
        attachBtn.addEventListener('click', () => {
          const dieSelect = item.querySelector('.select-spare-die');
          const dieIndex = dieSelect ? parseInt(dieSelect.value) : null;
          installModuleToSkill(skill, mod, dieIndex, true);
        });
      }

      selectorList.appendChild(item);
    });
  }

  // Render Deck breakdown
  const breakdownList = document.getElementById('deck-all-modules-breakdown');
  if (breakdownList) {
    breakdownList.innerHTML = '';

    state.deck.forEach((s, sIdx) => {
      const pageMods = [
        ...(s.installedModules || []).map(m => ({ ...m, scope: 'GLOBAL' })),
        ...s.dice.flatMap((d, di) => (d.installedModules || []).map(m => ({ ...m, scope: `DIE_${di + 1}` })))
      ];

      const group = document.createElement('div');
      group.className = 'module-item';
      group.style.marginBottom = '8px';

      const modListHtml = pageMods.length > 0
        ? pageMods.map(m => `<div>- [R${m.rank}] <strong>${m.name}</strong> (${m.scope}): <span class="text-dim">${m.effectText || ''}</span> ${m.isSpare ? '<span class="term-badge" style="color:var(--term-green); border-color:var(--term-green); font-size:9px;">[SPARE]</span>' : ''}</div>`).join('')
        : '<span class="text-dim">NO_MODULES_INSTALLED</span>';

      group.innerHTML = `
        <div class="module-item-header">
          <span class="module-item-title">[${sIdx + 1}] ${s.name.toUpperCase()} (${s.cost}L)</span>
          <span class="term-badge">${pageMods.length} MODS</span>
        </div>
        <div style="font-size:11px; margin-top:4px; line-height:1.4;">${modListHtml}</div>
      `;
      breakdownList.appendChild(group);
    });
  }
}

// Render Homebrew Manager List with Individual Switches
function renderHomebrewManager() {
  const container = document.getElementById('homebrew-manager-list');
  if (!container) return;
  container.innerHTML = '';

  // Update header count badge
  const headerCountEl = document.getElementById('header-hb-count');
  if (headerCountEl) {
    headerCountEl.textContent = state.enabledHbIds.size;
  }

  // Collect all homebrew items (modules and bases)
  const hbModules = window.MODULES.filter(m => m.isHomebrew);
  const hbBases = window.SKILL_BASES.filter(b => b.category === 'Community' || !!b.credit);

  // Group by Author / Source
  const groups = {};

  hbModules.forEach(m => {
    const author = m.source || 'Community Homebrew';
    groups[author] = groups[author] || { bases: [], modules: [] };
    groups[author].modules.push(m);
  });

  hbBases.forEach(b => {
    const author = b.credit ? `Community: ${b.credit}` : 'Community Homebrew';
    groups[author] = groups[author] || { bases: [], modules: [] };
    groups[author].bases.push(b);
  });

  const authors = Object.keys(groups);
  if (authors.length === 0) {
    container.innerHTML = '<p class="text-dim">NO_HOMEBREW_ITEMS_REGISTERED.</p>';
    return;
  }

  authors.forEach(author => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'hb-author-group';

    const groupItems = [...groups[author].bases, ...groups[author].modules];
    const allActive = groupItems.every(item => state.enabledHbIds.has(item.id));

    groupDiv.innerHTML = `
      <div class="hb-author-header">
        <div>
          <strong style="color:var(--term-amber); font-size:13px;">${author.toUpperCase()}</strong>
          <span class="text-dim" style="font-size:11px; margin-left:8px;">(${groupItems.length} ITENS)</span>
        </div>
        <button class="term-btn toggle-author-btn" style="padding:2px 8px; font-size:10px;">
          ${allActive ? '[ DISABLE_ALL_AUTHOR ]' : '[ ENABLE_ALL_AUTHOR ]'}
        </button>
      </div>
      <div class="hb-items-list"></div>
    `;

    groupDiv.querySelector('.toggle-author-btn').addEventListener('click', () => {
      const turnOn = !allActive;
      groupItems.forEach(item => {
        if (turnOn) state.enabledHbIds.add(item.id);
        else state.enabledHbIds.delete(item.id);
      });
      persistState();
      renderAll();
      showToast(`${author.toUpperCase()}: ${turnOn ? 'TODOS ATIVADOS' : 'TODOS DESATIVADOS'}`);
    });

    const itemsContainer = groupDiv.querySelector('.hb-items-list');

    // Bases
    groups[author].bases.forEach(b => {
      const isEnabled = state.enabledHbIds.has(b.id);
      const row = document.createElement('div');
      row.className = 'hb-item-row';
      row.innerHTML = `
        <label class="hb-checkbox-label">
          <input type="checkbox" data-hb-id="${b.id}" ${isEnabled ? 'checked' : ''}>
          <span>[BASE] <strong>${b.name}</strong> (${b.cost}L) - <span class="text-dim">${b.description}</span></span>
        </label>
        <span class="term-badge">BASE_PAGE</span>
      `;
      row.querySelector('input').addEventListener('change', (e) => {
        if (e.target.checked) state.enabledHbIds.add(b.id);
        else state.enabledHbIds.delete(b.id);
        persistState();
        renderAll();
      });
      itemsContainer.appendChild(row);
    });

    // Modules
    groups[author].modules.forEach(m => {
      const isEnabled = state.enabledHbIds.has(m.id);
      const row = document.createElement('div');
      row.className = 'hb-item-row';
      row.innerHTML = `
        <label class="hb-checkbox-label">
          <input type="checkbox" data-hb-id="${m.id}" ${isEnabled ? 'checked' : ''}>
          <span>[MOD R${m.rank}] <strong>${m.name}</strong> (${m.tag}) - <span class="text-dim">${m.description}</span></span>
        </label>
        <span class="term-badge">RANK_${m.rank}</span>
      `;
      row.querySelector('input').addEventListener('change', (e) => {
        if (e.target.checked) state.enabledHbIds.add(m.id);
        else state.enabledHbIds.delete(m.id);
        persistState();
        renderAll();
      });
      itemsContainer.appendChild(row);
    });

    container.appendChild(groupDiv);
  });
}

// Render System Glossary & Rule Reference
function renderGlossary() {
  const grid = document.getElementById('glossary-catalog-grid');
  if (!grid) return;
  grid.innerHTML = '';

  let entries = [];
  const cat = state.glossaryCategory;

  if (cat === 'all') {
    Object.keys(window.GLOSSARY).forEach(key => {
      entries = entries.concat(window.GLOSSARY[key]);
    });
  } else if (window.GLOSSARY[cat]) {
    entries = [...window.GLOSSARY[cat]];
  }

  if (state.glossarySearchQuery) {
    const q = state.glossarySearchQuery.toLowerCase();
    entries = entries.filter(e => e.name.toLowerCase().includes(q) || e.desc.toLowerCase().includes(q) || e.type.toLowerCase().includes(q));
  }

  if (entries.length === 0) {
    grid.innerHTML = '<p class="text-dim" style="padding:10px;">NO_GLOSSARY_ENTRIES_MATCHED_QUERY.</p>';
    return;
  }

  entries.forEach(item => {
    const card = document.createElement('div');
    card.className = 'glossary-card';
    card.innerHTML = `
      <div class="glossary-card-header">
        <span class="glossary-term-name">${item.name}</span>
        <span class="term-badge">${item.type.toUpperCase()}</span>
      </div>
      <p class="text-dim" style="font-size:11px; line-height:1.4;">${item.desc}</p>
    `;
    grid.appendChild(card);
  });
}

function rollActiveSkill() {
  const skill = getActiveSkill();
  const resultsArea = document.getElementById('roll-results-area');
  if (!skill || skill.dice.length === 0) {
    resultsArea.innerHTML = '<span class="text-dim">NO_DICE_TO_EXECUTE.</span>';
    return;
  }

  resultsArea.innerHTML = '';
  let totalRoll = 0;

  skill.dice.forEach((die, idx) => {
    const roll = Math.floor(Math.random() * die.sides) + 1;
    const finalValue = roll + (die.bonus || 0);
    totalRoll += finalValue;

    const line = document.createElement('div');
    line.style.display = 'flex';
    line.style.justifyContent = 'space-between';
    line.innerHTML = `
      <span>DIE_${idx + 1} [${die.selectedType.toUpperCase()} 1d${die.sides}${die.bonus ? `+${die.bonus}` : ''}]:</span>
      <strong class="text-bright">${finalValue} (RAW: ${roll})</strong>
    `;
    resultsArea.appendChild(line);
  });

  const summary = document.createElement('div');
  summary.style.marginTop = '4px';
  summary.style.borderTop = '1px solid var(--term-border)';
  summary.style.paddingTop = '4px';
  summary.style.display = 'flex';
  summary.style.justifyContent = 'space-between';
  summary.innerHTML = `
    <span>&gt; BARRAGE_TOTAL:</span>
    <strong style="color:var(--term-green); font-size:13px;">${totalRoll} PWR</strong>
  `;
  resultsArea.appendChild(summary);
}

function showToast(message) {
  const toast = document.getElementById('toast-notification');
  toast.textContent = `[SYS_LOG] ${message}`;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

function exportDeckMarkdown() {
  let md = `# STARS OF THE CITY // COMBAT DECK MANIFEST\n\n`;
  state.deck.forEach((s, i) => {
    md += `### [${i + 1}] ${s.name.toUpperCase()} (Light Cost: ${s.cost})\n`;
    if (s.globalTags?.length > 0) {
      md += `- Global: ${s.globalTags.join(' // ')}\n`;
    }
    if (s.installedModules?.length > 0) {
      md += `- Modules: ${s.installedModules.map(m => m.effectText).join(' // ')}\n`;
    }
    s.dice.forEach((d, di) => {
      const formula = `${d.count}d${d.sides}${d.bonus ? `+${d.bonus}` : ''}`;
      const effects = [
        ...(d.tags || []),
        ...(d.installedModules || []).map(m => m.effectText).filter(Boolean)
      ].join(' // ');
      md += `  - Die ${di + 1} [${d.selectedType}] \`${formula}\` ${effects ? `-> ${effects}` : ''}\n`;
    });
    md += `\n`;
  });

  navigator.clipboard.writeText(md).then(() => {
    showToast('DECK_COPIED_TO_CLIPBOARD_IN_MARKDOWN.');
  });
}

function exportDeckJSON() {
  const data = {
    deck: state.deck,
    spareVault: state.spareVault,
    enabledHbIds: Array.from(state.enabledHbIds)
  };
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `sotc_deck_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('DECK_JSON_FILE_EXPORTED.');
}

function importDeckJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const imported = JSON.parse(evt.target.result);
      if (Array.isArray(imported)) {
        state.deck = imported;
        state.activeSkillIndex = 0;
      } else if (imported.deck && Array.isArray(imported.deck)) {
        state.deck = imported.deck;
        if (imported.spareVault) state.spareVault = imported.spareVault;
        if (imported.enabledHbIds) state.enabledHbIds = new Set(imported.enabledHbIds);
        state.activeSkillIndex = 0;
      }
      persistDeck();
      renderAll();
      showToast('BUFFER_RELOADED_FROM_FILE.');
    } catch (err) {
      showToast('FILE_READ_EXCEPTION.');
    }
  };
  reader.readAsText(file);
}

function renderAll() {
  renderDeckList();
  renderBaseCatalog();
  renderDiceCustomizer();
  renderUniqueSkills();
  renderModuleCatalog();
  renderSpareVault();
  renderHomebrewManager();
  renderGlossary();
  renderCardPreview();
}

function setupEvents() {
  document.querySelectorAll('.term-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.term-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });

  document.getElementById('input-skill-name').addEventListener('input', (e) => {
    const skill = getActiveSkill();
    if (skill) {
      skill.name = e.target.value;
      persistDeck();
      renderDeckList();
      renderCardPreview();
    }
  });

  document.querySelectorAll('[data-cost-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-cost-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.costFilter = btn.getAttribute('data-cost-filter');
      renderBaseCatalog();
    });
  });

  document.querySelectorAll('[data-mod-rank]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-mod-rank]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.moduleRankFilter = btn.getAttribute('data-mod-rank');
      renderModuleCatalog();
    });
  });

  document.getElementById('input-module-search').addEventListener('input', (e) => {
    state.moduleSearchQuery = e.target.value;
    renderModuleCatalog();
  });

  const spareSearch = document.getElementById('input-spare-mod-search');
  if (spareSearch) {
    spareSearch.addEventListener('input', (e) => {
      state.spareSearchQuery = e.target.value;
      renderSpareVault();
    });
  }

  // Glossary filters
  document.querySelectorAll('[data-glossary-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-glossary-cat]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.glossaryCategory = btn.getAttribute('data-glossary-cat');
      renderGlossary();
    });
  });

  const glossSearch = document.getElementById('input-glossary-search');
  if (glossSearch) {
    glossSearch.addEventListener('input', (e) => {
      state.glossarySearchQuery = e.target.value;
      renderGlossary();
    });
  }

  // Spare vault buttons
  document.getElementById('btn-add-spare-r1').addEventListener('click', () => {
    state.spareVault.rank1 = (state.spareVault.rank1 || 0) + 1;
    persistState();
    renderSpareVault();
    showToast('SPARE_MODULE_ADDED: RANK 1');
  });

  document.getElementById('btn-add-spare-r2').addEventListener('click', () => {
    state.spareVault.rank2 = (state.spareVault.rank2 || 0) + 1;
    persistState();
    renderSpareVault();
    showToast('SPARE_MODULE_ADDED: RANK 2');
  });

  document.getElementById('btn-add-spare-r3').addEventListener('click', () => {
    state.spareVault.rank3 = (state.spareVault.rank3 || 0) + 1;
    persistState();
    renderSpareVault();
    showToast('SPARE_MODULE_ADDED: RANK 3');
  });

  // Homebrew Enable/Disable All buttons in Tab
  const btnHbEnableAll = document.getElementById('btn-hb-enable-all');
  if (btnHbEnableAll) {
    btnHbEnableAll.addEventListener('click', () => {
      window.MODULES.filter(m => m.isHomebrew).forEach(m => state.enabledHbIds.add(m.id));
      window.SKILL_BASES.filter(b => b.category === 'Community' || !!b.credit).forEach(b => state.enabledHbIds.add(b.id));
      persistState();
      renderAll();
      showToast('ALL_HOMEBREW_ITEMS_ENABLED.');
    });
  }

  const btnHbDisableAll = document.getElementById('btn-hb-disable-all');
  if (btnHbDisableAll) {
    btnHbDisableAll.addEventListener('click', () => {
      state.enabledHbIds.clear();
      persistState();
      renderAll();
      showToast('ALL_HOMEBREW_ITEMS_DISABLED.');
    });
  }

  // Homebrew Modal Open & Close Event Handlers
  const btnOpenHbModal = document.getElementById('btn-open-hb-modal');
  const btnCloseHbModal = document.getElementById('btn-close-hb-modal');
  const hbModalOverlay = document.getElementById('hb-modal-overlay');

  if (btnOpenHbModal && hbModalOverlay) {
    btnOpenHbModal.addEventListener('click', () => {
      renderHomebrewManager();
      hbModalOverlay.style.display = 'flex';
    });
  }

  if (btnCloseHbModal && hbModalOverlay) {
    btnCloseHbModal.addEventListener('click', () => {
      hbModalOverlay.style.display = 'none';
      renderAll();
    });
  }

  if (hbModalOverlay) {
    hbModalOverlay.addEventListener('click', (e) => {
      if (e.target === hbModalOverlay) {
        hbModalOverlay.style.display = 'none';
        renderAll();
      }
    });
  }

  document.getElementById('btn-add-new-skill').addEventListener('click', () => {
    if (state.deck.length >= 6) {
      showToast('BUFFER_CAP_REACHED: MAX 6 PAGES.');
      return;
    }
    const newSkill = createSkillFromBase(window.SKILL_BASES[0]);
    state.deck.push(newSkill);
    state.activeSkillIndex = state.deck.length - 1;
    persistDeck();
    renderAll();
    showToast('PAGE_ALLOCATED.');
  });

  document.getElementById('btn-clear-deck').addEventListener('click', () => {
    if (confirm('SYS_CONFIRM: RESET COMBAT BUFFER TO DEFAULT CONFIGURATION?')) {
      localStorage.removeItem('sotc_deck_build');
      localStorage.removeItem('sotc_spare_vault');
      state.spareVault = { rank1: 0, rank2: 0, rank3: 0 };
      initDefaultDeck();
      state.activeSkillIndex = 0;
      renderAll();
      showToast('BUFFER_RESET_COMPLETED.');
    }
  });

  const btnToggleCrt = document.getElementById('btn-toggle-crt');
  if (btnToggleCrt) {
    const crtSaved = localStorage.getItem('sotc_crt_enabled');
    if (crtSaved === 'false') {
      document.body.classList.add('crt-disabled');
      btnToggleCrt.textContent = '[ CRT_FX: OFF ]';
    }
    btnToggleCrt.addEventListener('click', () => {
      const isDisabled = document.body.classList.toggle('crt-disabled');
      btnToggleCrt.textContent = isDisabled ? '[ CRT_FX: OFF ]' : '[ CRT_FX: ON ]';
      localStorage.setItem('sotc_crt_enabled', !isDisabled);
      showToast(isDisabled ? 'CRT_FILTER_DISABLED' : 'CRT_FILTER_ENABLED');
    });
  }

  document.getElementById('btn-roll-active-skill').addEventListener('click', rollActiveSkill);
  document.getElementById('btn-export-markdown').addEventListener('click', exportDeckMarkdown);
  document.getElementById('btn-copy-card-markdown').addEventListener('click', exportDeckMarkdown);
  document.getElementById('btn-export-json').addEventListener('click', exportDeckJSON);
  document.getElementById('file-import-json').addEventListener('change', importDeckJSON);
}

document.addEventListener('DOMContentLoaded', () => {
  initDefaultDeck();
  setupEvents();
  renderAll();
});
