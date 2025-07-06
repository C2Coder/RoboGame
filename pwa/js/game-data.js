const timeouts = {"wood":10, "copper":10, "silicon":20, "lead":20, "tin":20, "plastic":20, "lithium":40, "steel":10, "ceramic":10};

const craftingRecipes = {
    "screw": {"steel": 1},
    "nut": {"steel": 1},

    "pcb": {"copper": 1, "plastic": 1},
    "solder": {"tin": 1, "lead": 1},

    "resistor": {"copper": 1, "ceramic": 1},
    "ic": {"silicon": 2, "copper": 1, "plastic": 1},
    "led": {"copper": 1, "plastic": 1},
    "button" : {"plastic": 1, "steel": 1, "copper": 1},
    "battery": {"lithium": 3, "plastic": 1, "steel": 1},
    "motor": {"steel": 2, "copper": 2},

    "robosvit": {"wood":2, "copper":4, "battery":1, "led":7, "resistor":1, "solder":1},
    "cube": {"pcb":1, "button":1, "ic":2, "led":7, "resistor":11, "solder":3},
    "smdChallenge": {"pcb":1,  "ic":1, "led":1, "resistor":2, "solder":1},
    "smdCube": {"pcb":1, "ic":1, "led":7, "resistor":4, "solder":2},
    "simon": {"pcb":1, "ic":1, "led":4, "resistor":4, "solder":2, "battery":1, "button":5},
    "slusmetr": {"pcb":1, "led":2, "resistor":2, "solder":1, "battery":1, "copper":2},
    "robutek": {"pcb":2, "ic":5, "led":7, "resistor":10, "solder":1, "battery":2, "button":5, "motor":2, "nut":4, "screw":4, "wood":8},

}

const transitions = {
        "wood": "Dřevo",
        "copper": "Měď",
        "silicon": "Křemík",
        "lead": "Olovo",
        "tin": "Cín",
        "plastic": "Plast",
        "lithium": "Lithium",
        "steel": "Ocel",
        "ceramic": "Keramika",

        "screw": "Šroub",
        "nut": "Matka",
        "pcb": "Deska",
        "solder": "Pájka",
        "resistor": "Rezistor",
        "ic": "Čip",
        "led": "LED",
        "diode": "Dioda",
        "button": "Tlačítko",
        "battery": "Baterka",
        "motor": "Motor",
        "robosvit": "RoboSvit",
        "cube": "Kostka",
        "smdChallenge": "Smd Výzva",
        "smdCube": "Smd Kostka",
        "simon": "Simon",
        "slusmetr": "Šlusmetr",
        "robutek": "Robutek",
    }
