"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class BookmakerParsingService extends events_1.EventEmitter {
    constructor() {
        super();
    }
    subscribeToSport(sport) { }
    subscribeToSports(sports) {
        sports.forEach((sport) => {
            this.subscribeToSport(sport);
        });
    }
    unsubscribeFromSport(sport) { }
    unsubscribeFromSports(sports) {
        sports.forEach((sport) => {
            this.unsubscribeFromSport(sport);
        });
    }
}
exports.BookmakerParsingService = BookmakerParsingService;
//# sourceMappingURL=BookmakerParsingService.js.map