const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

const token = jwt.sign({ sub: 'demo', organizationId: '11111111-1111-1111-1111-111111111111', role: 'SUPER_ADMIN' }, 'SUPER_SECRET_KEY_V3');

const headers = {
    'x-organization-id': '11111111-1111-1111-1111-111111111111',
    'x-user-role': 'SUPER_ADMIN',
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
};

async function seedDecathlon() {
    console.log('Creating organization Decathlon...');
    const orgRes = await fetch('http://76.13.59.115/api/organizations', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            name: 'Decathlon',
            type: 'Retail (Sport)',
            country: 'France',
            region: 'Hauts-de-France',
            city: "Villeneuve-d'Ascq",
            address: '4 Boulevard de Mons',
            postalCode: '59650',
            phone: '+33320335000',
            email: 'contact@decathlon.fr',
            legalForm: 'SA'
        })
    });

    if (!orgRes.ok) {
        console.error('Failed to create organization:', await orgRes.text());
        return;
    }

    const org = await orgRes.json();
    console.log('Org Decathlon Created:', org);

    const sites = [
        { name: 'Siège - Decathlon Campus', city: "Villeneuve-d'Ascq", address: '4 Boulevard de Mons', type: 'Bureaux & Campus', organizationId: org.id },
        { name: 'Magasin Decathlon - Paris Wagram', city: 'Paris', address: '26 Avenue de Wagram', type: 'Magasin Retail', organizationId: org.id },
        { name: 'Magasin Decathlon - Lyon Part-Dieu', city: 'Lyon', address: '17 Rue Dr Bouchut', type: 'Magasin Retail', organizationId: org.id },
        { name: 'Magasin Decathlon - Bordeaux Mérignac', city: 'Mérignac', address: '5 Rue Hipparque', type: 'Magasin Retail', organizationId: org.id }
    ];

    for (const site of sites) {
        const siteRes = await fetch('http://76.13.59.115/api/sites', {
            method: 'POST',
            headers,
            body: JSON.stringify(site)
        });
        console.log('Site created:', await siteRes.json());
    }
}

seedDecathlon().catch(console.error);
