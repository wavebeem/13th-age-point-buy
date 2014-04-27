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
    ["Human", "any"],
    ["Dwarf", "CON or WIS"],
    ["Half-Orc", "STR or DEX"],
    ["Dark Elf", "DEX or CHA"],
    ["High Elf", "INT or CHA"],
    ["Wood Elf", "DEX or WIS"],
    ["Gnome", "DEX or INT"],
    ["Half-Elves", "CON or CHA"],
    ["Halflings", "CON or DEX"],
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

var scores = {
    STR: ko.observable(10).extend({ abilityScore: true }),
    CON: ko.observable(10).extend({ abilityScore: true }),
    DEX: ko.observable(10).extend({ abilityScore: true }),
    INT: ko.observable(10).extend({ abilityScore: true }),
    WIS: ko.observable(10).extend({ abilityScore: true }),
    CHA: ko.observable(10).extend({ abilityScore: true }),
};


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

var $root = {
    scores: scores,
    modifiers: {
        STR: modFor(scores.STR),
        CON: modFor(scores.CON),
        DEX: modFor(scores.DEX),
        INT: modFor(scores.INT),
        WIS: modFor(scores.WIS),
        CHA: modFor(scores.CHA),
    },
    cost: cost,
    racialScoreBonuses: racialScoreBonuses,
    selectAll: selectAll,
    inc: inc,
    dec: dec,
    over: over,
};

ko.applyBindings($root);
