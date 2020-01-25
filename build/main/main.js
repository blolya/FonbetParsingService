"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FonbetParsingService_1 = require("../bookmakers/fonbet/FonbetParsingService");
const Odds_1 = require("../types/Odds");
const main = () => {
    const fps = new FonbetParsingService_1.FonbetParsingService();
    fps.subscribeToSports([Odds_1.CommonFormats.Sport.TENNIS]);
    fps.on("factor", (factor) => {
        console.log(factor);
    });
};
main();
//# sourceMappingURL=main.js.map