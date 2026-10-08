/** Original training fixtures. Numeric balance is NOT an official HV arena. */
export const SCHEMA_VERSION = 2;
export const MAX_SAVE_BYTES = 5_000_000;
export const MAX_LEGACY_RECOVERY_BYTES = 20_000_000;
export const EQUIPMENT_QUALITIES = Object.freeze(['Crude','Fair','Average','Superior','Exquisite','Magnificent','Legendary','Peerless','Peerless+','Ultimate']);
export const RULES_VERSION = 'persistent-0.91-training-v31';
export const ATTRIBUTE_KEYS = Object.freeze(['str', 'dex', 'agi', 'end', 'int', 'wis']);
export const RULES = Object.freeze({
  version: RULES_VERSION,
  baseline: 'Persistent 0.91 · 2026-10-07 公開文件候選規格',
  encounterName: '裂隙演練',
  encounterNotice: '原創訓練遭遇 · 2 波 × 3 隻 · 數值暫定，非原版 Arena',
  tickUnits: 100, minActionUnits: 20, maxActionUnits: 500,
  overchargeCap: 250, spiritThreshold: 50,
  sources: {
    time: 'https://ehwiki.org/index.php?title=Action_Speed&oldid=64923',
    skills: 'https://ehwiki.org/index.php?title=Skills&oldid=65273',
    spirit: 'https://ehwiki.org/index.php?title=Spirit_Stance&oldid=65231',
    overcharge: 'https://ehwiki.org/wiki/Overcharge',
    baseline: 'https://ehwiki.org/wiki/HentaiVerse',
    rounds: 'https://ehwiki.org/index.php?title=Battles&oldid=64927#Victory',
    recovery: 'https://ehwiki.org/index.php?title=Battles&oldid=64927#Recovering',
    equipment: 'https://ehwiki.org/index.php?title=Equipment_Basics&oldid=65026',
    allocation: 'https://ehwiki.org/index.php?title=Character_Stats&oldid=65166#Experience_Point_Allocation',
    vitals: 'https://ehwiki.org/index.php?title=Character_Stats&oldid=65166#Vitals',
  },
  provisional: ['角色衍生公式', '裝備及怪物數值', '傷害與命中抽樣', '法術消耗取整與部分技能冷卻', '敵方排程與結算順序', 'Spirit Stance 的 turn / round 解讀'],
  externalBonuses: Object.freeze({ hath: 0, gp: 0, donation: 0, forum: 0, isekaiAttributes: 0, tower: 0, rewardMultiplier: 1, externalEligibility: false }),
});

const item = (id, name, slot, quality, attack, magic, defense, burden, description) => ({ id, name, slot, quality, attack, magic, defense, burden, description, templateId: id, origin: 'starter-fixture', container: 'inventory', pinned: false, protected: false, category: slot === 'weapon' ? id.startsWith('staff-') ? 'staff' : 'one-handed' : slot === 'offhand' ? 'shield' : id === 'robe-tide' ? 'cloth' : id === 'plate-sentinel' ? 'heavy' : 'light', level: ['Crude','Fair','Average','Superior'].includes(quality) ? null : 20, hands: slot === 'weapon' ? id.startsWith('staff-') ? 2 : 1 : 0, locked: false, bound: false, iwLevel: 0, forgeLevel: 0 });
export const STARTER_ITEMS = Object.freeze([
  item('blade-dawn', '曙光長刃', 'weapon', 'Superior', 29, 2, 0, 7, '原創演練長刃。偏重物理攻擊；裝備模板與數值皆為暫定樣本。'),
  item('staff-ember', '餘燼法杖', 'weapon', 'Exquisite', 8, 35, 0, 3, '原創演練法杖。提高魔力；尚未套用完整法杖熟練度與流派機制。'),
  item('blade-dusk', '暮色短劍', 'weapon', 'Average', 23, 5, 0, 1, '原創演練短劍。輕量替代選項；不含未驗證的隱藏詞綴。'),
  item('coat-traveler', '旅者輕甲', 'body', 'Superior', 0, 0, 16, 8, '原創演練輕甲。只驗證目前三槽樣本的配裝比較流程。'),
  item('robe-tide', '潮汐法袍', 'body', 'Exquisite', 0, 12, 8, 2, '原創演練法袍。以防禦換取魔力；完整護甲件數與能力條件尚待施工。'),
  item('plate-sentinel', '哨衛重甲', 'body', 'Superior', 0, 0, 26, 30, '原創演練重甲。較高防禦與負重；負重公式屬暫定模型。'),
  item('shield-ash', '灰木圓盾', 'offhand', 'Average', 0, 0, 11, 5, '原創演練盾。只提供樣本防禦，格擋與反擊尚未實作。'),
]);

export const TRAINING_WAVES = Object.freeze([
  [
    { name: '暮影獵犬', title: '裂隙遊蕩者', kind: 'wolf', level: 19, maxHp: 128, attack: 18, interval: 105, resistances: { physical: 0.06, fire: -0.2 } },
    { name: '裂隙守衛', title: '殘存的意志', kind: 'golem', level: 20, maxHp: 185, attack: 23, interval: 140, resistances: { physical: 0.22, fire: 0.05 } },
    { name: '失落幽魂', title: '餘燼之聲', kind: 'wraith', level: 20, maxHp: 115, attack: 17, interval: 115, resistances: { physical: 0.15, fire: -0.15 } },
  ],
  [
    { name: '霜暮獵犬', title: '深層裂隙', kind: 'wolf', level: 21, maxHp: 145, attack: 20, interval: 100, resistances: { physical: 0.08, fire: -0.2 } },
    { name: '古老守衛', title: '最後防線', kind: 'golem', level: 22, maxHp: 205, attack: 25, interval: 135, resistances: { physical: 0.25, fire: 0.1 } },
    { name: '徘徊幽魂', title: '夜色回音', kind: 'wraith', level: 21, maxHp: 135, attack: 19, interval: 110, resistances: { physical: 0.16, fire: -0.12 } },
  ],
]);

export const ACTIONS = Object.freeze([
  { id: 'attack', name: '普通攻擊', icon: '⚔', target: true, baseTime: 1, description: '對選定目標進行物理攻擊；命中累積 5–10 OC。傷害暫定。' },
  { id: 'fire', name: '烈焰衝擊', icon: '✦', target: true, baseTime: 1.2, mana: 6, cooldown: 2, description: '單體火焰法術。消耗 6 MP、冷卻 2 個非道具行動均為訓練採用值。' },
  { id: 'cure', name: '治癒', icon: '✚', baseTime: 0.2, mana: 10, cooldown: 3, description: '恢復生命；採用暫定治療量、消耗及冷卻。' },
  { id: 'scan', name: '探查', icon: '◎', target: true, baseTime: 1, description: '解鎖該目標精確生命、等級與抗性；不揭露未來行動。' },
  { id: 'defend', name: '防禦', icon: '◇', baseTime: 1, description: '本次及下次行動減少 25% 傷害。原版回復量有版本衝突，本演練暫不回血或扣 OC。' },
  { id: 'focus', name: '專注', icon: '◉', baseTime: 1, description: '提高下次行動的法術命中；下次行動無法閃避。若 OC ≥ 25，扣 25 並回復 5% 基礎 MP。' },
  { id: 'spirit', name: '靈動架式', icon: '☄', baseTime: 0.2, description: '至少 50 OC 開啟；物理傷害 ×2、MP 消耗 ×0.75。後續每個行動消耗 10 OC / 1 SP，時間解讀暫定。' },
  { id: 'healthPotion', name: '生命藥水', icon: '♥', item: 'health', baseTime: 0, cooldown: 4, description: '零內部時間；只推進其他道具冷卻。恢復 50% HP、冷卻 4 行動為訓練採用值。' },
  { id: 'manaPotion', name: '魔力藥水', icon: '◆', item: 'mana', baseTime: 0, cooldown: 4, description: '零內部時間；只推進其他道具冷卻。恢復 40% MP、冷卻 4 行動為訓練採用值。' },
  { id: 'spiritPotion', name: '靈力藥水', icon: '✦', item: 'spirit', baseTime: 0, cooldown: 40, description: '新系列即時恢復基礎 SP 的來源候選比例；零內部時間，40 道具／一般行動冷卻。' },
  { id: 'flee', name: '撤退', icon: '↗', baseTime: 0.5, description: '離開演練；撤退期間敵方仍可出手。時間採暫定值，不發獎勵。' },
]);
