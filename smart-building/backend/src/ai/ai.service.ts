import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);

    /**
     * Parse natural language text to extract automation rule parameters.
     * This simulates an LLM by using advanced Regex and synonym dictionaries.
     */
    parseRuleRequest(prompt: string) {
        this.logger.log(`Natural Language Input: "${prompt}"`);
        const text = prompt.toLowerCase();

        // 1. Identify Building & Room (Default heuristics)
        let building = 'Siège Social (Paris)';
        if (text.match(/partout|global|tous les b(a|â)timents|entreprise|tout le parc/i)) building = 'Global';
        else if (text.match(/lyon|entrep(o|ô)t/i)) building = 'Entrepôt Lyon';
        else if (text.match(/tour|d(é|e)fense/i)) building = 'Tour Défense';

        let room = 'Open Space R+1';
        if (building === 'Global') room = 'Tous les espaces';
        else if (text.match(/r(é|e)union/i)) room = 'Salle de Réunion A';
        else if (text.match(/accueil|entr(e|é)e/i)) room = 'Accueil';
        else if (text.match(/caf(e|é)t(e|é)ria|manger|pause/i)) room = 'Cafétéria';
        else if (text.match(/tout|global|b(a|â)timent/i)) room = 'Tous les espaces';

        // 2. Identify Intent / Smart Templates
        let isComplex = false;
        let triggers: Array<{ name: string, condition: string, value: string }> = [];
        let actions: Array<{ name: string, target: string }> = [];
        let message = "";

        // Template A: Anti-gaspillage (Window + HVAC)
        if (text.match(/anti-gaspi|anti gaspi|fen(e|ê)tre/i) && text.match(/clim|chauffage|cvc/i)) {
            isComplex = true;
            triggers = [
                { name: 'Contacteur M/A (Fenêtre)', condition: 'Ouverte', value: '> 2 min' }
            ];
            actions = [
                { name: 'Ajuster Consigne CVC', target: 'OFF (Coupure de sécurité)' }
            ];
            message = `✨ **Template GTB détecté : Anti-Gaspillage**\nJ'ai configuré la règle : SI une fenêtre est ouverte (plus de 2 minutes) ALORS on coupe immédiatement le CVC sur : ${room} (${building}).`;
        }
        // Template B: Nuit / Horaires (Global Shutdown)
        else if (text.match(/nuit|soir|20h|fermeture|extinct/i)) {
            isComplex = true;
            building = building === 'Siège Social (Paris)' && text.match(/partout|global/i) ? 'Global' : building;
            room = 'Tous les espaces';
            triggers = [
                { name: 'Calendrier/Horaires', condition: '=', value: '20:00 - 07:00' },
                { name: 'Présence', condition: 'Non', value: '30 min' }
            ];
            actions = [
                { name: 'Allumer/Éteindre Lumières', target: 'OFF (Extinction Totale)' },
                { name: 'Ajuster Consigne CVC', target: 'Mode Nuit (Inoccupé)' }
            ];
            message = `✨ **Template GTB détecté : Veille Nocturne**\nJ'ai configuré la règle combinée : SI on est hors horaires (20h-7h) ET qu'il n'y a personne depuis 30min, ALORS on coupe les lumières et on passe le CVC en mode nuit sur tout le bâtiment.`;
        }
        // Template C: Optimisation Présence (Eco Mode)
        else if (text.match(/pr(é|e)sence|occup|vide|personne/i) && text.match(/clim|chauffage|cvc/i)) {
            isComplex = true;
            triggers = [
                { name: 'Présence', condition: 'Non', value: '15 min' }
            ];
            actions = [
                { name: 'Ajuster Consigne CVC', target: 'Mode ÉCO (Inoccupé)' }
            ];
            message = `✨ **Template GTB détecté : Optimisation Présence**\nJ'ai configuré l'optimisation : SI la zone ${room} est vide pendant 15 minutes, le CVC passe automatiquement en mode Éco.`;
        }
        // Standard (Legacy 1:1 Rule Builder fallback)
        else {
            let triggerName = 'Température';
            let condition = '>';
            let value = '25';
            let actionName = 'Ajuster Consigne CVC';
            let actionTarget = 'Veille / Éco';

            // Extract logic (same as before)
            if (text.match(/pr(é|e)sence|mouvement|vide|personne|quelqu'un|occup/i)) {
                triggerName = 'Présence';
                condition = text.match(/vide|personne|plus|absence/i) ? 'Non' : 'Oui';
                const timeMatch = text.match(/(\d+)\s*(min|minute|h|heure)/i);
                value = timeMatch ? `${timeMatch[1]} ${timeMatch[2]}` : '10 min';
            } else if (text.match(/co2|air/i)) {
                triggerName = 'CO2'; condition = '>'; value = '900 ppm';
            } else if (text.match(/temp(e|é)rature|degr(e|é)s|clim|chauffage/i)) {
                triggerName = 'Température'; condition = text.match(/froid|baisse/i) ? '<' : '>';
                const numMatch = text.match(/(\d{1,2})/); value = numMatch ? numMatch[1] : '24';
            }

            if (text.match(/lumi(e|è)re|(é|e)clairage|allum|(é|e)tein/i)) {
                actionName = 'Allumer/Éteindre Lumières'; actionTarget = text.match(/allum/i) ? 'ON' : 'OFF';
            } else if (text.match(/clim|chauffage|cvc|temp(e|é)rature/i)) {
                actionName = 'Ajuster Consigne CVC'; actionTarget = text.match(/baisse/i) ? '-2°C' : 'Confort';
            }

            triggers = [{ name: triggerName, condition, value }];
            actions = [{ name: actionName, target: actionTarget }];
            message = `Règle simple générée pour ${room} (${building}) : **SI** ${triggerName} ${condition} ${value} **ALORS** ${actionName} = ${actionTarget}.`;
        }

        const result = {
            interpretations: {
                building,
                room,
                isComplex,
                triggers,
                actions,
                // Backward compatibility for simple rule UI logic (UI legacy mode support)
                trigger: triggers[0],
                action: actions[0]
            },
            message
        };

        this.logger.log(`Parsed Result: ${JSON.stringify(result, null, 2)}`);
        return result;
    }
}
