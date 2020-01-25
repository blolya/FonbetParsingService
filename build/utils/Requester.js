"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("./react");
const url_1 = __importDefault(require("url"));
const request_1 = __importDefault(require("request"));
class Requester extends react_1.Flowable {
    constructor(address = "", options = {}, timeout = 1000) {
        super();
        if (!new url_1.default.URL(address)) {
            throw Error();
        }
        this.interval = setInterval(async () => {
            request_1.default(address, options, (err, res, body) => {
                this.emit("response", body);
            });
        }, timeout);
    }
    unsubscribe() {
        clearInterval(this.interval);
    }
}
exports.Requester = Requester;
//# sourceMappingURL=Requester.js.map