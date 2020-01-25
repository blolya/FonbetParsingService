"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BookmakerParsingService_1 = require("../BookmakerParsingService");
const Odds_1 = require("../../types/Odds");
const Requester_1 = require("../../utils/Requester");
const FactorsCatalogUpdate_1 = require("./updates/FactorsCatalogUpdate");
const GeneralUpdate_1 = require("./updates/GeneralUpdate");
const FonbetGeneral_1 = require("./FonbetGeneral");
const fonbetSports_1 = require("./sports/fonbetSports");
const TennisCommonFormats_1 = require("./sports/tennis/TennisCommonFormats");
const BasketballCommonFormats_1 = require("./sports/basketball/BasketballCommonFormats");
class FonbetParsingService extends BookmakerParsingService_1.BookmakerParsingService {
    constructor() {
        super();
        this.factorsCatalog = {};
        this.subscribedSports = {};
        this.sports = {};
        this.events = {};
        this.factors = {};
        this.factorsCatalogRequester = new Requester_1.Requester(FactorsCatalogUpdate_1.FactorsCatalogUpdate.url, { gzip: true });
        this.factorsCatalogRequester.on("response", rawFactorsCatalog => this.updateFactorsCatalog(JSON.parse(rawFactorsCatalog)));
        this.updatesRequester = new Requester_1.Requester(GeneralUpdate_1.Update.url, { gzip: true });
        this.updatesRequester.on("response", rawUpdate => this.handleUpdate(JSON.parse(rawUpdate)));
    }
    subscribeToSports(sports = []) {
        sports.forEach(sport => {
            this.subscribeToSport(sport);
        });
    }
    subscribeToSport(sport) {
        if (!sport)
            return;
        const sportId = fonbetSports_1.fonbetSports[sport].id;
        if (!this.subscribedSports[sportId])
            this.subscribedSports[sportId] = {
                id: sportId,
                parentId: 0,
                name: sport,
                sport: sport
            };
    }
    updateFactorsCatalog(factorsCatalogUpdate) {
        // Clear current factors catalog
        this.factorsCatalog = {};
        factorsCatalogUpdate.groups.forEach((group) => {
            group.tables.forEach(table => {
                const tableHeader = table.rows[0];
                const tableBody = table.rows.slice(1);
                let subtitle = "";
                tableBody.forEach(row => {
                    row.forEach((cell, cellNum) => {
                        if (!table.name) {
                            if (cellNum == 0)
                                subtitle = cell.name;
                            else
                                this.factorsCatalog[cell.factorId] = {
                                    title: tableHeader[0].name,
                                    subtitle: subtitle,
                                    outcome: tableHeader[cellNum].name
                                };
                        }
                        else {
                            if (cell.kind === "param")
                                subtitle = tableHeader[cellNum].name;
                            else if (cell.kind === "value")
                                this.factorsCatalog[cell.factorId] = {
                                    title: table.name,
                                    subtitle: subtitle,
                                    outcome: tableHeader[cellNum].name
                                };
                        }
                    });
                });
            });
        });
    }
    handleUpdate(update) {
        this.updateSports(update.sports);
        this.updateEvents(update.events);
        this.updateFactors(update.customFactors);
        this.pourFactors();
    }
    updateSports(sportsUpdates) {
        this.sports = {};
        for (let sportId in this.subscribedSports)
            this.sports[sportId] = this.subscribedSports[sportId];
        sportsUpdates.forEach((sportUpdate) => {
            // Add a new Sport if it doesn't already exist
            if (!this.sports.hasOwnProperty(sportUpdate.id))
                this.sports[sportUpdate.id] =
                    new FonbetGeneral_1.FonbetGeneral.Sport(sportUpdate.id, sportUpdate.name, sportUpdate.parentId);
        });
    }
    updateEvents(eventsUpdates) {
        this.events = {};
        eventsUpdates.forEach((eventUpdate) => {
            this.events[eventUpdate.id] =
                new FonbetGeneral_1.FonbetGeneral.Event(eventUpdate.id, eventUpdate.sportId, eventUpdate.team1Id, eventUpdate.team2Id, eventUpdate.team1, eventUpdate.team2, eventUpdate.name, eventUpdate.parentId);
        });
    }
    updateFactors(factorsUpdates) {
        // Set odds status to outdated
        for (let factorId in this.factors)
            this.factors[factorId].deleted = true;
        factorsUpdates.forEach(factorUpdate => {
            const factor = this.makeFactor(factorUpdate);
            if (factor)
                this.factors["" + factorUpdate.e + factorUpdate.f] = factor;
        });
    }
    makeFactor(factorUpdate) {
        if (!this.events[factorUpdate.e])
            throw Error(`The event #${factorUpdate.e} doesn't exist`);
        const event = this.events[factorUpdate.e];
        const mainEvent = this.getTopEvent(event);
        event.team1 = mainEvent.team1;
        event.team2 = mainEvent.team2;
        event.team1Id = mainEvent.team1Id;
        event.team2Id = mainEvent.team2Id;
        const sport = this.sports[event.sportId];
        const mainSport = this.getTopSport(sport);
        sport.sport = mainSport.sport;
        if (!this.subscribedSports[mainSport.id])
            return null;
        const factorInfo = this.factorsCatalog[factorUpdate.f];
        const factor = new FonbetGeneral_1.FonbetGeneral.Factor(factorUpdate, factorInfo);
        if (sport.sport === Odds_1.CommonFormats.Sport.TENNIS) {
            return new TennisCommonFormats_1.TennisCommonFormats.Factor(sport, event, factor);
        }
        if (sport.sport === Odds_1.CommonFormats.Sport.BASKETBALL) {
            return new BasketballCommonFormats_1.BasketballCommonFormats.Factor(sport, event, factor);
        }
        return null;
    }
    getTopSport(sport) {
        let topSport = sport;
        while (topSport.parentId)
            topSport = this.sports[topSport.parentId];
        return topSport;
    }
    getTopEvent(event) {
        let topEvent = event;
        while (topEvent.parentId)
            topEvent = this.events[topEvent.parentId];
        return topEvent;
    }
    pourFactors() {
        for (let factorsId in this.factors) {
            this.emit("factor", this.factors[factorsId]);
            // Delete outdated odds
            if (this.factors[factorsId].deleted)
                delete this.factors[factorsId];
        }
    }
}
exports.FonbetParsingService = FonbetParsingService;
//# sourceMappingURL=FonbetParsingService.js.map