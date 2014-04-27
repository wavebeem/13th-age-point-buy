ko.extenders.abilityScore = function(target, arg) {
    var result = ko.computed({
        read: target,
        write: function(score) {
            score = clamp(8, 18, Number(score));
            target(score);
            target.notifySubscribers(score);
        }
    }).extend({
        notify: 'always'
    });

    result(target());

    return result;
};

var clamp = function(min, max, x) {
    if (x < min) return min;
    if (x > max) return max;
    return x;
};

var selectAll = function() {
    event.target.select();
};

var scoreToCost = function(score) {
    return {
        18: 16,
        17: 13,
        16: 10,
        15:  8,
        14:  6,
        13:  5,
        12:  4,
        11:  3,
        10:  2,
         9:  1,
         8:  0,
    }[score];
};

var racialScoreBonuses = [
    ["Human",       "any"],
    ["Dwarf",       "CON or WIS"],
    ["Half-Orc",    "STR or DEX"],
    ["Dark Elf",    "DEX or CHA"],
    ["High Elf",    "INT or CHA"],
    ["Wood Elf",    "DEX or WIS"],
    ["Gnome",       "DEX or INT"],
    ["Half-Elves",  "CON or CHA"],
    ["Halflings",   "CON or DEX"],
];

var classScoreBonuses = [
    ["Barbarian",   "STR or CON"],
    ["Bard",        "DEX or CHA"],
    ["Cleric",      "WIS or STR"],
    ["Fighter",     "STR or CON"],
    ["Paladin",     "STR or CHA"],
    ["Ranger",      "DEX or STR"],
    ["Rogue",       "DEX or CHA"],
    ["Sorcerer",    "CHA or CON"],
    ["Wizard",      "INT or WIS"],
];

var abilityNames = [
    'STR',
    'CON',
    'DEX',
    'INT',
    'WIS',
    'CHA',
];

var add = function(a, b) { return a + b };

var scoreForName = function(name) {
    return scores[name]();
};

var cost = ko.computed({
    read: function() {
        return abilityNames
            .map(scoreForName)
            .map(scoreToCost)
            .reduce(add);
    },
    deferEvaluation: true
});

var favored = _.reduce(abilityNames, function(o, n) {
    o[n] = ko.observable(false);
    return o;
}, {});

var scores = _.reduce(abilityNames, function(o, n) {
    o[n] = ko.observable(10).extend({ abilityScore: true });
    return o;
}, {});

var totals = _.reduce(abilityNames, function(o, n) {
    o[n] = ko.computed(function() {
        return scores[n]() + (favored[n]() ? 2 : 0);
    });
    return o;
}, {});

var modFor = function(ability) {
    return ko.computed(function() {
        var score = ability();
        return Math.floor((score - 10) / 2);
    });
};

var inc = function(abilityName) {
    var ability = scores[abilityName];
    ability(ability() + 1);
};

var dec = function(abilityName) {
    var ability = scores[abilityName];
    ability(ability() - 1);
};

var over = ko.computed(function() {
    return cost() > 28;
});

var formatMod = function(mod) {
    if (mod >= 0) return "+" + mod;
    return "" + mod;
};

var modifiers = _.reduce(abilityNames, function(o, n) {
    o[n] = modFor(totals[n]);
    return o;
}, {});

var toggleFavored = function(name) {
    favored[name](!favored[name]());
};

var wideGroupedAbilityNames = [[
    'STR', 'CON', 'DEX',
    'INT', 'WIS', 'CHA',
]];

var narrowGroupedAbilityNames = [
    ['STR', 'CON', 'DEX'],
    ['INT', 'WIS', 'CHA'],
];

var width = ko.observable(document.documentElement.clientWidth);

window.onresize = function() {
    width(document.documentElement.clientWidth);
};

var groupedAbilityNames = ko.computed(function() {
    if (width() < 800) return narrowGroupedAbilityNames;
    return wideGroupedAbilityNames;
});

var $root = {
    scores: scores,
    modifiers: modifiers,
    cost: cost,
    racialScoreBonuses: racialScoreBonuses,
    selectAll: selectAll,
    inc: inc,
    dec: dec,
    over: over,
    totals: totals,
    favored: favored,
    toggleFavored: toggleFavored,
    groupedAbilityNames: groupedAbilityNames,
};

ko.applyBindings($root);
