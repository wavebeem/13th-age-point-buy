var valueCoercer = function(f) {
    return function(target, arg) {
        var result = ko.computed({
            read: target,
            write: function(x) {
                x = f(x);
                target(x);
                target.notifySubscribers(x);
            }
        }).extend({
            notify: 'always'
        });

        result(target());

        return result;
    };
};

ko.extenders.abilityScore = valueCoercer(function(x) {
    return clamp(8, 18, Number(x));
});

var clamp = function(min, max, x) {
    if (x < min) return min;
    if (x > max) return max;
    return x;
};

var scoreToCost = function(score) {
    return ({
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
    }[score]);
};

var racialScoreBonuses = [
    ["Human",       ["any"]],
    ["Dwarf",       ["CON", "WIS"]],
    ["Half-Orc",    ["STR", "DEX"]],
    ["Dark Elf",    ["DEX", "CHA"]],
    ["High Elf",    ["INT", "CHA"]],
    ["Wood Elf",    ["DEX", "WIS"]],
    ["Gnome",       ["DEX", "INT"]],
    ["Half-Elves",  ["CON", "CHA"]],
    ["Halflings",   ["CON", "DEX"]],

    ["Dragonic",    ["STR", "CHA"]],
    ["Forgeborn",   ["STR", "CON"]],
    ["Aasimar",     ["WIS", "CHA"]],
    ["Tiefling",    ["STR", "INT"]],
];

var classScoreBonuses = [
    ["Barbarian",   ["STR", "CON"]],
    ["Bard",        ["DEX", "CHA"]],
    ["Cleric",      ["WIS", "STR"]],
    ["Fighter",     ["STR", "CON"]],
    ["Paladin",     ["STR", "CHA"]],
    ["Ranger",      ["DEX", "STR", "WIS"]],
    ["Rogue",       ["DEX", "CHA"]],
    ["Sorcerer",    ["CHA", "CON"]],
    ["Wizard",      ["INT", "WIS"]],

    ["Chaos Mage",  ["INT", "CHA"]],
    ["Commander",   ["STR", "CHA"]],
    ["Druid",       ["STR", "DEX", "WIS"]],
    ["Monk",        ["STR", "DEX", "WIS"]],
    ["Necromancer", ["INT", "CHA"]],
    ["Occultist",   ["INT", "WIS"]],
];

var baseHpMod = {
    "Barbarian"  : 7,
    "Bard"       : 7,
    "Cleric"     : 7,
    "Fighter"    : 8,
    "Paladin"    : 8,
    "Ranger"     : 7,
    "Rogue"      : 6,
    "Sorcerer"   : 6,
    "Wizard"     : 6,
};

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

var middle = function(a, b, c) {
    return [a, b, c].sort()[1];
};

var modifierAc = ko.computed(function() {
    return middle(
        modifiers.CON(),
        modifiers.DEX(),
        modifiers.WIS()
    );
});

var modifierPd = ko.computed(function() {
    return middle(
        modifiers.STR(),
        modifiers.CON(),
        modifiers.DEX()
    );
});

var modifierMd = ko.computed(function() {
    return middle(
        modifiers.INT(),
        modifiers.WIS(),
        modifiers.CHA()
    );
});

ko.applyBindings({});
