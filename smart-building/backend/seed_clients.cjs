const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

const token = jwt.sign({ sub: 'demo', organizationId: '11111111-1111-1111-1111-111111111111', role: 'SUPER_ADMIN' }, 'SUPER_SECRET_KEY_V3');

const headers = {
    'x-organization-id': '11111111-1111-1111-1111-111111111111',
    'x-user-role': 'SUPER_ADMIN',
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
};

async function seed() {
    // Client 1: Tamoil
    const org1Res = await fetch('http://76.13.59.115/api/organizations', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            name: 'Tamoil Suisse',
            type: 'Retail (Energy)',
            country: 'Suisse',
            region: 'Genève',
            city: 'Genève 15 Aéroport',
            address: 'Route de Pré-Bois 29',
            postalCode: '1215',
            phone: '+41229100006',
            email: 'contact@tamoil.ch',
            legalForm: 'SA'
        })
    });
    const org1 = await org1Res.json();
    console.log('Org 1 Created:', org1);

    const sites1 = [
        { name: 'Station Tamoil - Genève Centre', city: 'Genève', address: 'Rue de Lausanne', type: 'Station Essence', organizationId: org1.id },
        { name: 'Station Tamoil - Aéroport', city: 'Genève 15 Aéroport', address: 'Route de Pré-Bois 29', type: 'Station Essence', organizationId: org1.id },
        { name: 'Station Tamoil - Meyrin', city: 'Meyrin', address: 'Route de Meyrin', type: 'Station Essence', organizationId: org1.id }
    ];

    for (const site of sites1) {
        const siteRes = await fetch('http://76.13.59.115/api/sites', {
            method: 'POST',
            headers,
            body: JSON.stringify(site)
        });
        console.log('Site created:', await siteRes.json());
    }

    // Client 2: Generic
    const org2Res = await fetch('http://76.13.59.115/api/organizations', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            name: 'Client Tech Corp',
            type: 'Corporate',
            country: 'France',
            region: 'Île-de-France',
            city: 'Paris',
            address: 'Avenue de l\'Innovation',
            postalCode: '75001',
            phone: '+33140000000',
            email: 'contact@techcorp.fr',
            legalForm: 'SAS'
        })
    });
    const org2 = await org2Res.json();
    console.log('Org 2 Created:', org2);
}
seed().catch(console.error);
