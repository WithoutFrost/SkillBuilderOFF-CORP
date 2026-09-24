// STARS OF THE CITY // HANA_NET COMBAT PROTOCOL CORE

// Application State
const state = {
  activeSkillIndex: 0,
  deck: [],
  spareVault: {
    rank1: 0,
    rank2: 0,
    rank3: 0,
    unassigned: [] // Array of specific unassigned module definitions or counts
  },
  costFilter: 'all',
  moduleRankFilter: 'all',
  moduleSearchQuery: '',
  glossaryCategory: 'all',
  glossarySearchQuery: '',
  enableHomebrew: false, // Default: OFF as requested
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

  // Load HB toggle state
  const savedHb = localStorage.getItem('sotc_hb_enabled');
  if (savedHb !== null) {
    state.enableHomebrew = (savedHb === 'true');
  }
}

function persistState() {
  localStorage.setItem('sotc_deck_build', JSON.stringify(state.deck));
  localStorage.setItem('sotc_spare_vault', JSON.stringify(state.spareVault));
  localStorage.setItem('sotc_hb_enabled', state.enableHomebrew);
}

function persistDeck() {
  persistState();
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
    // Check Homebrew filter
    const isHb = base.category === 'Community' || !!base.credit;
    if (isHb && !state.enableHomebrew) return false;

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
    // Check Homebrew filter
    if (mod.isHomebrew && !state.enableHomebrew) return false;

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
        installModuleToSkill(skill, mod, dieIndex);
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
    row.innerHTML = `
      <div class="module-item-header">
        <span class="module-item-title">${mod.name.toUpperCase()} ${sourceTag}</span>
        <span class="term-badge" style="border-color:var(--term-amber); color:var(--term-amber)">RANK_${mod.rank} // GLOBAL</span>
      </div>
      <p class="module-item-desc">${mod.effectText}</p>
      <button class="term-btn term-btn-danger" style="align-self:flex-end; padding:1px 6px; font-size:10px;" data-remove-global="${idx}">[DETACH]</button>
    `;
    row.querySelector('[data-remove-global]').addEventListener('click', () => {
      skill.installedModules.splice(idx, 1);
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
      row.innerHTML = `
        <div class="module-item-header">
          <span class="module-item-title">${mod.name.toUpperCase()} ${sourceTag}</span>
          <span class="term-badge">RANK_${mod.rank} // DIE_${dieIdx + 1}</span>
        </div>
        <p class="module-item-desc">${mod.effectText || mod.name}</p>
        <button class="term-btn term-btn-danger" style="align-self:flex-end; padding:1px 6px; font-size:10px;" data-remove-die="${dieIdx}" data-remove-mod="${modIdx}">[DETACH]</button>
      `;
      row.querySelector('[data-remove-die]').addEventListener('click', () => {
        die.installedModules.splice(modIdx, 1);
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

// Pure Declarative Recalculation of Dice Stats from Original Base
function recalculateSkillDice(skill) {
  if (skill.isUnique) {
    const origUnique = window.UNIQUE_SKILLS.find(u => u.id === skill.baseId);
    if (!origUnique) return;
    
    // Filter out extra dice if Extra Die module was removed
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
      // Re-apply die module mutations
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

  // Handle Extra Die Module addition/removal
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

  // Reset each die to base stats and re-apply active module modifiers
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

    // Re-apply module transforms
    (die.installedModules || []).forEach(m => {
      const modDef = window.MODULES.find(md => md.id === m.id);
      if (modDef && modDef.apply) {
        modDef.apply(die);
      }
    });
  });
}

function installModuleToSkill(skill, mod, dieIndex) {
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

  // Strict Tag Collision Prevention
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

  if (mod.target === 'die' && dieIndex !== null && skill.dice[dieIndex]) {
    const targetDie = skill.dice[dieIndex];
    const effect = typeof mod.effectText === 'function' ? mod.effectText(skill.cost, targetDie) : mod.effectText;
    targetDie.installedModules = targetDie.installedModules || [];
    targetDie.installedModules.push({
      id: mod.id,
      name: mod.name,
      rank: mod.rank,
      tag: mod.tag,
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
      isHomebrew: mod.isHomebrew || false,
      source: mod.source || 'Core Official',
      effectText: effect
    });
  }

  recalculateSkillDice(skill);
  persistDeck();
  renderAll();
  showToast(`MODULE_MOUNTED: ${mod.name.toUpperCase()}`);
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
    const r1 = (skill.installedModules || []).filter(m => m.rank === 1).length +
      skill.dice.reduce((acc, d) => acc + (d.installedModules || []).filter(m => m.rank === 1).length, 0);
    const r2 = (skill.installedModules || []).filter(m => m.rank === 2).length +
      skill.dice.reduce((acc, d) => acc + (d.installedModules || []).filter(m => m.rank === 2).length, 0);
    
    if (r1 < 3 || r2 < 1) {
      issues.push({
        type: 'info',
        text: `INNATE_QUOTA_INCOMPLETE: ${r1}/3 Rank 1 and ${r2}/1 Rank 2 allocated.`
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

  const badgeModEl = document.getElementById('badge-module-count');
  if (skill.isUnique) {
    badgeModEl.textContent = `MODS: ${totalMod} (UNIQUE_PRESET)`;
  } else {
    badgeModEl.textContent = `MODS: ${totalMod} / 4 [R1: ${r1Count}/3 | R2: ${r2Count}/1${r3Count ? ` | R3: ${r3Count}` : ''}]`;
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

// Render Spare Modules Vault
function renderSpareVault() {
  document.getElementById('spare-count-r1').textContent = state.spareVault.rank1 || 0;
  document.getElementById('spare-count-r2').textContent = state.spareVault.rank2 || 0;
  document.getElementById('spare-count-r3').textContent = state.spareVault.rank3 || 0;

  // Calculate total active deck modules
  let deckActiveMods = 0;
  state.deck.forEach(s => {
    deckActiveMods += (s.installedModules?.length || 0) +
      s.dice.reduce((acc, d) => acc + (d.installedModules?.length || 0), 0);
  });
  document.getElementById('deck-total-active-mods').textContent = `${deckActiveMods} ATTACHED`;

  const unassignedList = document.getElementById('spare-unassigned-list');
  unassignedList.innerHTML = '';

  const totalSpares = (state.spareVault.rank1 || 0) + (state.spareVault.rank2 || 0) + (state.spareVault.rank3 || 0);
  document.getElementById('unassigned-spare-count').textContent = totalSpares;

  if (totalSpares === 0) {
    unassignedList.innerHTML = '<p class="text-dim" style="padding:8px;">VAULT_IS_EMPTY. USE BUTTONS ABOVE TO ACCUMULATE SPARE MODULES FROM LEVELING OR INTELLECT.</p>';
  } else {
    for (let r = 1; r <= 3; r++) {
      const count = state.spareVault[`rank${r}`] || 0;
      if (count > 0) {
        const item = document.createElement('div');
        item.className = 'module-item';
        item.innerHTML = `
          <div class="module-item-header">
            <span class="module-item-title">SPARE MODULES [RANK ${r}]</span>
            <span class="term-badge">COUNT: ${count}</span>
          </div>
          <p class="module-item-desc">Disponíveis para anexar livremente em qualquer carta de combate do buffer.</p>
          <div style="display:flex; justify-content:flex-end; gap:6px; margin-top:4px;">
            <button class="term-btn term-btn-danger" style="padding:1px 6px; font-size:10px;" data-remove-spare="${r}">[ - 1 ]</button>
          </div>
        `;
        item.querySelector('[data-remove-spare]').addEventListener('click', () => {
          if (state.spareVault[`rank${r}`] > 0) {
            state.spareVault[`rank${r}`]--;
            persistState();
            renderSpareVault();
          }
        });
        unassignedList.appendChild(item);
      }
    }
  }

  // Render Deck breakdown
  const breakdownList = document.getElementById('deck-all-modules-breakdown');
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
      ? pageMods.map(m => `<div>- [R${m.rank}] <strong>${m.name}</strong> (${m.scope}): <span class="text-dim">${m.effectText || ''}</span></div>`).join('')
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
    spareVault: state.spareVault
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

  // Homebrew Toggle Button
  const btnToggleHb = document.getElementById('btn-toggle-hb');
  if (btnToggleHb) {
    btnToggleHb.textContent = state.enableHomebrew ? '[ HB_CONTENT: ON ]' : '[ HB_CONTENT: OFF ]';
    btnToggleHb.addEventListener('click', () => {
      state.enableHomebrew = !state.enableHomebrew;
      btnToggleHb.textContent = state.enableHomebrew ? '[ HB_CONTENT: ON ]' : '[ HB_CONTENT: OFF ]';
      persistState();
      renderAll();
      showToast(state.enableHomebrew ? 'HOMEBREW_CONTENT_ACTIVATED' : 'HOMEBREW_CONTENT_DEACTIVATED');
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
      state.spareVault = { rank1: 0, rank2: 0, rank3: 0, unassigned: [] };
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
